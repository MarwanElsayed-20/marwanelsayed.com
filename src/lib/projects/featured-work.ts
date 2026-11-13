import { featuredProjectSlugs } from "@/content/projects/featured";
import { productLabels, workOrder } from "@/content/projects/work-order";
import { productProjects, projects } from "./repository";
import { buildWorkEntries, type WorkEntry } from "./work";

export const MIN_FEATURED = 3;
export const MAX_FEATURED = 6;

/** Picks the featured entries in the owner's order, failing at build time on any bad slug. */
export function resolveFeatured(
  entries: readonly WorkEntry[],
  slugs: readonly string[],
): WorkEntry[] {
  if (slugs.length < MIN_FEATURED || slugs.length > MAX_FEATURED)
    throw new Error(`Feature ${MIN_FEATURED} to ${MAX_FEATURED} projects, not ${slugs.length}`);
  const seen = new Set<string>();
  return slugs.map((slug) => {
    if (seen.has(slug)) throw new Error(`Duplicate featured slug: ${slug}`);
    seen.add(slug);
    const entry = entries.find((candidate) => candidate.slug === slug);
    if (!entry) throw new Error(`Unknown featured slug: ${slug}`);
    return entry;
  });
}

export const featuredEntries = resolveFeatured(
  buildWorkEntries(projects, productProjects, workOrder, productLabels),
  featuredProjectSlugs,
);
