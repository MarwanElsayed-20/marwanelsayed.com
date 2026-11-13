import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/site/seo";
import { siteOrigin } from "@/lib/site/site-origin";
import { sitemapPaths } from "@/lib/site-pages";

/** Built from the same registry that drives page metadata, so the two cannot disagree. */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(siteOrigin(process.env), sitemapPaths());
}
