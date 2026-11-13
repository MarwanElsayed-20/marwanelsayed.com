import { workOrder, productLabels } from "@/content/projects/work-order";
import { projects, productProjects } from "./repository";
import { categories, digitalExperiences, digitalProducts } from "@/config/projects";
import { projectPath } from "./select";
import type { BaseProject, CategoryId, ProjectProgress, ProjectSection, SectionId } from "./types";

export type WorkEntry = Pick<
  BaseProject,
  "slug" | "title" | "summary" | "image" | "builtWith" | "period" | "scope"
> & {
  category: string;
  categoryId: CategoryId;
  section: SectionId;
  href: string;
  productLabel?: string;
  disclosure?: string;
  progress?: ProjectProgress;
};

/** Fail at build time rather than silently dropping or repeating a project. */
export function buildWorkEntries(
  projects: readonly BaseProject[],
  productProjects: readonly BaseProject[],
  order: readonly string[],
  labels: Readonly<Record<string, string>>,
): WorkEntry[] {
  const records = new Map<string, { project: BaseProject; section: ProjectSection }>();
  for (const [list, section] of [
    [projects, digitalExperiences],
    [productProjects, digitalProducts],
  ] as const) {
    for (const project of list) {
      if (records.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
      records.set(project.slug, { project, section });
    }
  }
  const seen = new Set<string>();
  const closedLabels = new Set<string>();
  let previousLabel: string | undefined;
  for (const slug of Object.keys(labels)) {
    if (!records.has(slug)) throw new Error(`Unknown product label slug: ${slug}`);
  }
  const entries = order.map((slug) => {
    if (seen.has(slug)) throw new Error(`Duplicate work slug: ${slug}`);
    seen.add(slug);
    const record = records.get(slug);
    if (!record) throw new Error(`Unknown work slug: ${slug}`);
    const productLabel = labels[slug];
    if (previousLabel !== productLabel) {
      if (previousLabel) closedLabels.add(previousLabel);
      if (productLabel && closedLabels.has(productLabel))
        throw new Error(`Product label must be adjacent: ${productLabel}`);
    }
    previousLabel = productLabel;
    const { project, section } = record;
    return {
      slug,
      title: project.title,
      summary: project.summary,
      image: project.image,
      builtWith: project.builtWith,
      period: project.period,
      scope: project.scope,
      category: categories[project.category].name,
      categoryId: project.category,
      section: section.id,
      href: projectPath(section.basePath, slug),
      productLabel,
      progress: project.progress,
      disclosure:
        project.image?.kind === "capture"
          ? "Real interface, sample data"
          : project.image?.kind === "reconstruction"
            ? "Reconstruction"
            : undefined,
    };
  });
  const missing = [...records.keys()].filter((slug) => !seen.has(slug));
  if (missing.length) throw new Error(`Missing work slugs: ${missing.join(", ")}`);
  const toolswift = [
    "toolswift-customer-dashboard",
    "toolswift-admin-platform",
    "toolswift-marketing",
  ];
  if (
    toolswift.some((slug) => records.has(slug)) &&
    toolswift.some((slug, index) => order[index] !== slug)
  ) {
    throw new Error("ToolSwift projects must be first in the approved order");
  }
  return entries;
}

export type WorkNeighbors = { previous?: WorkEntry; next?: WorkEntry };

/** Adjacent entries in the validated Work order; endpoints do not wrap. */
export function neighbors(slug: string): WorkNeighbors {
  const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index < 0) throw new Error(`Unknown work slug: ${slug}`);
  return { previous: entries[index - 1], next: entries[index + 1] };
}
