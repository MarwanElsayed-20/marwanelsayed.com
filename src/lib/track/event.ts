/**
 * Visit signals for the owner's dashboard: a CV download or a case study opened. They carry no
 * personal data: the kind, the page path, the visitor's country (from the host's geo header) and
 * the host name of the site the visit started from. No IP address, no identifier, no cookie.
 */
export const VISIT_KINDS = ["cv_download", "case_study"] as const;
export type VisitKind = (typeof VISIT_KINDS)[number];

/** What the browser sends to /api/track. */
export type VisitSignal = { kind: VisitKind; path: string; referrer: string };

/** What the portfolio forwards to the dashboard. */
export type VisitEvent = VisitSignal & { country: string };

const MAX_PATH = 200;

/** The host name of a referrer URL, lower case, without "www."; empty when there is none. */
export function referrerHost(referrer: unknown): string {
  if (typeof referrer !== "string" || referrer === "") return "";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host.replace(/^www\./, "").slice(0, 100);
  } catch {
    return "";
  }
}

/** Accepts only a known kind and a site path; anything else is dropped. */
export function parseVisitSignal(raw: unknown): VisitSignal | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const { kind, path, referrer } = raw as Record<string, unknown>;
  if (typeof kind !== "string" || !(VISIT_KINDS as readonly string[]).includes(kind)) return null;
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.length > MAX_PATH || /[\s<>"]/.test(path)) return null;
  return { kind: kind as VisitKind, path, referrer: referrerHost(referrer) };
}

/** A two-letter country code from the host's geo header, or empty. */
export function countryCode(header: string | null): string {
  const code = header?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(code) ? code : "";
}

/** Crawlers, link previews and headless browsers: not visitors. */
const BOT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT.test(userAgent);
}

/** The dashboard's visit endpoint, next to its message endpoint. */
export function visitEndpoint(ingestUrl: string): string {
  return new URL("/api/ingest/events", ingestUrl).toString();
}

/** A case study page: one slug under a section's base path, such as /saas-dashboards/aligna. */
export function isCaseStudyPath(path: string, basePaths: readonly string[]): boolean {
  return basePaths.some((base) => {
    if (!path.startsWith(`${base}/`)) return false;
    const slug = path.slice(base.length + 1);
    return /^[a-z0-9-]+$/.test(slug);
  });
}
