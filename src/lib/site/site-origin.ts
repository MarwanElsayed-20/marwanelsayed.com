export type Env = Readonly<Record<string, string | undefined>>;

const RESERVED_SUFFIXES = [".example", ".invalid", ".test", ".localhost"] as const;
const RESERVED_DOMAINS = ["example.com", "example.org", "example.net"] as const;

/**
 * Returns the origin (scheme and host, no path) of an absolute https:// address, or `null`
 * when the value is missing or unusable. Never guesses.
 */
export function parseSiteOrigin(raw: string | null | undefined): string | null {
  if (raw === undefined || raw === null) return null;
  const value = raw.trim();
  if (value === "") return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username !== "" || url.password !== "") return null;
  if (url.hostname === "") return null;
  return url.origin;
}

/**
 * The site's public origin for canonical addresses and the sitemap.
 * Previews and local development servers on Vercel never name themselves canonical.
 */
export function siteOrigin(env: Env): string | null {
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") return null;
  return parseSiteOrigin(env.SITE_URL);
}

/** Stricter rules used by the pre-launch check. An empty list means the value is launch-ready. */
export function siteUrlProblems(raw: string | null | undefined): string[] {
  if (raw === undefined || raw === null || raw.trim() === "") {
    return ["SITE_URL is not set."];
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return ["SITE_URL is not a valid absolute URL."];
  }
  const problems: string[] = [];
  if (url.protocol !== "https:") problems.push("SITE_URL must start with https://.");
  if (url.username !== "" || url.password !== "") {
    problems.push("SITE_URL must not contain credentials.");
  }
  if ((url.pathname !== "/" && url.pathname !== "") || url.search !== "" || url.hash !== "") {
    problems.push("SITE_URL must be an origin only, without a path, query or fragment.");
  }
  const host = url.hostname.toLowerCase();
  const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
  if (!host.includes(".") || host.startsWith("[") || isIpv4) {
    problems.push(
      "SITE_URL must be a public domain name, not localhost, an IP address or one word.",
    );
  }
  const reserved =
    RESERVED_SUFFIXES.some((suffix) => host.endsWith(suffix)) ||
    RESERVED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (reserved) problems.push("SITE_URL must not use a reserved example host.");
  return problems;
}
