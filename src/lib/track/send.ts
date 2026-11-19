import { cleanDetail, type VisitKind } from "./event";

/** Set on the owner's own devices (any page with ?notrack=1; ?notrack=0 undoes it). */
export const NO_TRACK_KEY = "portfolio:no-track";
export const FIRST_REFERRER_KEY = "portfolio:first-referrer";

/** Browser storage can be missing or blocked; a signal is never worth an error. */
export function safely<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch {
    return fallback;
  }
}

/**
 * Sends one signal to /api/track from the browser, as a beacon so it survives the page closing.
 * Nothing is sent from the owner's own devices.
 */
export function sendSignal(kind: VisitKind, path: string, detail = "") {
  if (typeof window === "undefined") return;
  if (safely(() => localStorage.getItem(NO_TRACK_KEY) === "1", false)) return;
  const referrer = safely(() => sessionStorage.getItem(FIRST_REFERRER_KEY) ?? "", "");
  // Cleaned here too, so nothing personal ever leaves the browser.
  const body = new Blob([JSON.stringify({ kind, path, referrer, detail: cleanDetail(detail) })], {
    type: "application/json",
  });
  safely(() => {
    if (!navigator.sendBeacon?.("/api/track", body))
      void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }, undefined);
}

const REPORTED = "portfolio:errors-reported";

/** A page error, reported once per description per visit so a loop cannot flood the owner. */
export function reportClientError(detail: string) {
  const key = detail.slice(0, 200);
  const reported = safely<string[]>(() => JSON.parse(sessionStorage.getItem(REPORTED) ?? "[]"), []);
  if (reported.includes(key)) return;
  safely(
    () => sessionStorage.setItem(REPORTED, JSON.stringify([...reported, key].slice(-20))),
    undefined,
  );
  sendSignal("client_error", location.pathname, detail);
}
