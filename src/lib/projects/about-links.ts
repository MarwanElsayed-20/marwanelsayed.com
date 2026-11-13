import { productLabels, workOrder } from "@/content/projects/work-order";
import { productProjects, projects } from "./repository";
import { buildWorkEntries } from "./work";

export type AboutLink = { label: string; href: string };

/** The case studies the About page points to, by slug; an unknown or repeated slug fails the build. */
export function resolveAboutLinks(
  slugs: readonly string[],
  titles: ReadonlyMap<string, AboutLink>,
): AboutLink[] {
  const seen = new Set<string>();
  return slugs.map((slug) => {
    if (seen.has(slug)) throw new Error(`About links to ${slug} twice`);
    seen.add(slug);
    const link = titles.get(slug);
    if (!link) throw new Error(`About links to an unknown project: ${slug}`);
    return link;
  });
}

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);

/** Every case study by slug, as the label and address a link needs. */
export const workLinks: ReadonlyMap<string, AboutLink> = new Map(
  entries.map((entry) => [entry.slug, { label: entry.title, href: entry.href }]),
);
