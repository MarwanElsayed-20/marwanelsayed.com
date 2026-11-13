import { siteContent } from "@/lib/site-content";

/** Neutral description of the site. Also the home introduction until the owner supplies one. */
export const siteDescription =
  "A portfolio of websites, e-commerce stores, SaaS products and dashboards.";

/**
 * Site identity. `name` is the owner-supplied name or wordmark, or the neutral name "Portfolio"
 * until one is supplied (see src/content/site/identity.ts).
 */
export const site = {
  name: siteContent.siteName ?? "Portfolio",
} as const;
