"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { isCaseStudyPath, type VisitKind } from "@/lib/track/event";

const FIRST_REFERRER = "portfolio:first-referrer";
const SENT = "portfolio:signals-sent";
const BASE_PATHS = [digitalExperiences.basePath, digitalProducts.basePath];

/** Session storage can be missing or blocked; a signal is never worth an error. */
function session<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

/** Each kind and page is reported once per browser session, so a double click counts once. */
function send(kind: VisitKind, path: string) {
  const key = `${kind}:${path}`;
  const sent = session<string[]>(() => JSON.parse(sessionStorage.getItem(SENT) ?? "[]"), []);
  if (sent.includes(key)) return;
  session(() => sessionStorage.setItem(SENT, JSON.stringify([...sent, key].slice(-50))), undefined);
  const referrer = session(() => sessionStorage.getItem(FIRST_REFERRER) ?? "", "");
  const body = new Blob([JSON.stringify({ kind, path, referrer })], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", body))
    void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

/**
 * Tells the owner's dashboard when the CV is downloaded or a case study is opened, with the site
 * the visit started from. Nothing personal is sent (see src/lib/track/event.ts). Renders nothing.
 */
export function VisitSignals() {
  const pathname = usePathname();

  useEffect(() => {
    // The site the visit came from, kept for the session; links within the site never replace it.
    session(() => {
      if (sessionStorage.getItem(FIRST_REFERRER) !== null) return;
      const from = document.referrer;
      const external = from !== "" && new URL(from).host !== location.host;
      sessionStorage.setItem(FIRST_REFERRER, external ? from : "");
    }, undefined);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("[data-cv-download]");
      if (link) send("cv_download", location.pathname);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (pathname && isCaseStudyPath(pathname, BASE_PATHS)) send("case_study", pathname);
  }, [pathname]);

  return null;
}
