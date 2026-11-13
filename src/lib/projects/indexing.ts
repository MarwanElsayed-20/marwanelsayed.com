import { projectPath } from "@/lib/projects/select";
import type { BaseProject, ProjectSection } from "@/lib/projects/types";

/** A listing is indexable only when it holds at least one real (non-sample) project. */
export function isListingIndexable(projects: readonly BaseProject[]): boolean {
  return projects.some((project) => project.sample !== true);
}

/**
 * Real detail paths a sitemap may advertise for a section; home owns the section itself.
 */
export function indexablePaths(
  section: ProjectSection,
  projects: readonly BaseProject[],
): string[] {
  const real = projects.filter((project) => project.sample !== true);
  if (real.length === 0) return [];
  return real.map((project) => projectPath(section.basePath, project.slug));
}
