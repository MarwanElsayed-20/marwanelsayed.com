"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { isCaseStudyPath, type VisitKind } from "@/lib/track/event";
import {
  FIRST_REFERRER_KEY,
  NO_TRACK_KEY,
  reportClientError,
  safely,
  sendSignal,
} from "@/lib/track/send";

const SENT = "portfolio:signals-sent";
const BASE_PATHS = [digitalExperiences.basePath, digitalProducts.basePath];

/** CV downloads and case studies are reported once per page per session: a double click counts once. */
function sendOnce(kind: VisitKind, path: string) {
  const key = `${kind}:${path}`;
  const sent = safely<string[]>(() => JSON.parse(sessionStorage.getItem(SENT) ?? "[]"), []);
  if (sent.includes(key)) return;
  safely(() => sessionStorage.setItem(SENT, JSON.stringify([...sent, key].slice(-50))), undefined);
  sendSignal(kind, path);
}

/**
 * Errors worth the owner's attention: not the browser's opaque cross-origin "Script error.", not
 * extensions' code, and not ResizeObserver's harmless loop warning.
 */
export function describeError(message: unknown, source?: string, line?: number): string | null {
  const text = typeof message === "string" ? message : String(message ?? "");
  if (!text || text === "Script error." || /ResizeObserver loop/.test(text)) return null;
  if (source && !/^https?:/.test(source)) return null;
  const file = source ? source.split("/").pop()?.split("?")[0] : "";
  return file ? `${text} (${file}${line ? `:${line}` : ""})` : text;
}

/**
 * Tells the owner's dashboard about page views, CV downloads, case studies opened and errors that
 * break a page, with the site the visit started from. Nothing personal is sent (see
 * src/lib/track/event.ts). Renders nothing.
 */
export function VisitSignals() {
  const pathname = usePathname();

  useEffect(() => {
    safely(() => {
      const flag = new URLSearchParams(location.search).get("notrack");
      if (flag === "1") localStorage.setItem(NO_TRACK_KEY, "1");
      if (flag === "0") localStorage.removeItem(NO_TRACK_KEY);
    }, undefined);
    // The site the visit came from, kept for the session; links within the site never replace it.
    safely(() => {
      if (sessionStorage.getItem(FIRST_REFERRER_KEY) !== null) return;
      const from = document.referrer;
      const external = from !== "" && new URL(from).host !== location.host;
      sessionStorage.setItem(FIRST_REFERRER_KEY, external ? from : "");
    }, undefined);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("[data-cv-download]");
      if (link) sendOnce("cv_download", location.pathname);
    };
    const onError = (event: ErrorEvent) => {
      const detail = describeError(event.message, event.filename, event.lineno);
      if (detail) reportClientError(detail);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: unknown } | undefined;
      const detail = describeError(reason?.message ?? reason);
      if (detail) reportClientError(`Unhandled: ${detail}`);
    };
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;
    sendSignal("page_view", pathname);
    if (isCaseStudyPath(pathname, BASE_PATHS)) sendOnce("case_study", pathname);
  }, [pathname]);

  return null;
}
