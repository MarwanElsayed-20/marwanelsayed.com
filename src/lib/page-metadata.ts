import type { Metadata } from "next";
import { site } from "@/config/site";
import { siteOrigin } from "@/lib/site/site-origin";

type PageTitle = string | { absolute: string };

type PageMetadataInput = {
  title: PageTitle;
  description: string;
  /** Whether search engines may index the page. */
  index: boolean;
  /** The page's path, for example `/about`. Adds the canonical address when a site origin exists. */
  path?: string;
};

/**
 * The one place page metadata is built, so titles, descriptions, and link previews cannot drift.
 * Public images belong to the file-based metadata routes. Non-public pages clear inherited images.
 * The canonical address is added only when SITE_URL is a valid public origin (never guessed, and
 * never on preview deployments).
 */
export function pageMetadata({ title, description, index, path }: PageMetadataInput): Metadata {
  const origin = siteOrigin(process.env);
  const url = origin !== null && path !== undefined ? `${origin}${path}` : undefined;
  const shownTitle = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    robots: { index: index && process.env.VERCEL_ENV !== "preview", follow: true },
    ...(url === undefined ? {} : { alternates: { canonical: url } }),
    openGraph: {
      title: shownTitle,
      description,
      siteName: site.name,
      type: "website",
      ...(!index ? { images: [] } : {}),
      ...(url === undefined ? {} : { url }),
    },
    twitter: {
      card: "summary_large_image",
      title: shownTitle,
      description,
      ...(!index ? { images: [] } : {}),
    },
  };
}
