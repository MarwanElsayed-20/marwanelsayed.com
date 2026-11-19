"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { isCaseStudyPath, type VisitKind } from "@/lib/track/event";

const FIRST_REFERRER = "portfolio:first-referrer";
const SENT = "portfolio:signals-sent";
/** Set on the owner's own devices (visit any page with ?notrack=1; ?notrack=0 undoes it). */
const NO_TRACK = "portfolio:no-track";
const BASE_PATHS = [digitalExperiences.basePath, digitalProducts.basePath];

/** Browser storage can be missing or blocked; a signal is never worth an error. */
function safely<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

function beacon(kind: VisitKind, path: string) {
  if (safely(() => localStorage.getItem(NO_TRACK) === "1", false)) return;
  const referrer = safely(() => sessionStorage.getItem(FIRST_REFERRER) ?? "", "");
  const body = new Blob([JSON.stringify({ kind, path, referrer })], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", body))
    void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

/** CV downloads and case studies are reported once per page per session: a double click counts once. */
function sendOnce(kind: VisitKind, path: string) {
  const key = `${kind}:${path}`;
  const sent = safely<string[]>(() => JSON.parse(sessionStorage.getItem(SENT) ?? "[]"), []);
  if (sent.includes(key)) return;
  safely(() => sessionStorage.setItem(SENT, JSON.stringify([...sent, key].slice(-50))), undefined);
  beacon(kind, path);
}

/**
 * Tells the owner's dashboard about page views, CV downloads and case studies opened, with the
 * site the visit started from. Nothing personal is sent (see src/lib/track/event.ts). Renders
 * nothing.
 */
export function VisitSignals() {
  const pathname = usePathname();

  useEffect(() => {
    safely(() => {
      const flag = new URLSearchParams(location.search).get("notrack");
      if (flag === "1") localStorage.setItem(NO_TRACK, "1");
      if (flag === "0") localStorage.removeItem(NO_TRACK);
    }, undefined);
    // The site the visit came from, kept for the session; links within the site never replace it.
    safely(() => {
      if (sessionStorage.getItem(FIRST_REFERRER) !== null) return;
      const from = document.referrer;
      const external = from !== "" && new URL(from).host !== location.host;
      sessionStorage.setItem(FIRST_REFERRER, external ? from : "");
    }, undefined);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("[data-cv-download]");
      if (link) sendOnce("cv_download", location.pathname);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!pathname) return;
    beacon("page_view", pathname);
    if (isCaseStudyPath(pathname, BASE_PATHS)) sendOnce("case_study", pathname);
  }, [pathname]);

  return null;
}
