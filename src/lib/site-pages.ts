import type { Metadata } from "next";
import { aboutContent } from "@/content/site/about";
import { homeContent } from "@/content/site/home";
import { servicesContent, servicesPage } from "@/content/site/services";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/page-metadata";
import { indexablePaths } from "@/lib/projects/indexing";
import { productProjects, projects } from "@/lib/projects/repository";

export type PageId = "home" | "work" | "services" | "about";

export type PageEntry = {
  readonly id: PageId;
  readonly path: string;
  readonly title: string | { readonly absolute: string };
  readonly description: string;
  /** Whether search engines may index the page. Drives both page metadata and the sitemap. */
  readonly index: boolean;
};

export type RegistryInput = {
  readonly siteName: string;
};

export function buildPageRegistry(input: RegistryInput): readonly PageEntry[] {
  return [
    {
      id: "home",
      path: "/",
      title: { absolute: `${input.siteName} | Front-end engineer` },
      description: homeContent.introduction ?? homeContent.headline,
      index: true,
    },
    {
      id: "work",
      path: "/work",
      title: "Work",
      description:
        "Websites, e-commerce stores, SaaS products and dashboards, shown as real interfaces with sample data.",
      index: true,
    },
    {
      id: "services",
      path: "/services",
      title: "Services",
      description: servicesPage.description,
      index: true,
    },
    {
      id: "about",
      path: "/about",
      title: "About",
      description: aboutContent.introduction[0] ?? homeContent.headline,
      index: true,
    },
  ];
}

export const pageRegistry = buildPageRegistry({
  siteName: site.name,
});

export function pageEntry(id: PageId): PageEntry {
  const entry = pageRegistry.find((candidate) => candidate.id === id);
  if (entry === undefined) throw new Error(`Unknown page id: ${id}`);
  return entry;
}

/** Metadata for a registered page. Use it as `export const metadata = metadataFor("home")`. */
export function metadataFor(id: PageId): Metadata {
  const entry = pageEntry(id);
  return pageMetadata({
    title: entry.title,
    description: entry.description,
    index: entry.index,
    path: entry.path,
  });
}

/** Every path a sitemap may advertise: indexable registry pages plus real project pages. */
export function sitemapPaths(): string[] {
  const paths = new Set<string>();
  for (const entry of pageRegistry) {
    if (entry.index) paths.add(entry.path);
  }
  for (const service of servicesContent.services) paths.add(`/services/${service.id}`);
  for (const path of indexablePaths(digitalExperiences, projects)) paths.add(path);
  for (const path of indexablePaths(digitalProducts, productProjects)) paths.add(path);
  return [...paths];
}
