import { siteOrigin, type Env } from "./site-origin";

export type RobotsOutput = {
  readonly rules: {
    readonly userAgent: string;
    readonly allow?: string;
    readonly disallow?: string;
  };
  readonly sitemap?: string;
};

export type SitemapEntry = { readonly url: string };

/**
 * Crawler rules. Previews are closed to crawlers. Elsewhere everything is open and the sitemap is
 * advertised only when a valid public origin exists (never guessed).
 */
export function buildRobots(env: Env): RobotsOutput {
  if (env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const origin = siteOrigin(env);
  if (origin === null) return { rules: { userAgent: "*", allow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${origin}/sitemap.xml` };
}

/** Absolute sitemap entries. Without an origin there is nothing honest to list, so it is empty. */
export function buildSitemap(origin: string | null, paths: readonly string[]): SitemapEntry[] {
  if (origin === null) return [];
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];
  for (const path of paths) {
    const url = `${origin}${path}`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url });
  }
  return entries;
}
