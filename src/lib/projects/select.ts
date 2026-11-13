import { categories } from "@/config/projects";
import type { BaseProject, CategoryId, ProjectCategory } from "@/lib/projects/types";

export type CategoryGroup<T extends BaseProject = BaseProject> = {
  category: ProjectCategory;
  projects: readonly T[];
};

/** Groups projects by category in the given order; empty categories are omitted. File order is kept. */
export function groupByCategory<T extends BaseProject>(
  projects: readonly T[],
  categoryIds: readonly CategoryId[],
): CategoryGroup<T>[] {
  return categoryIds
    .map((id) => ({
      category: categories[id],
      projects: projects.filter((project) => project.category === id),
    }))
    .filter((group) => group.projects.length > 0);
}

export function findBySlug<T extends BaseProject>(
  projects: readonly T[],
  slug: string,
): T | undefined {
  return projects.find((project) => project.slug === slug);
}

export function projectPath(basePath: string, slug: string): string {
  return `${basePath}/${slug}`;
}

export function sectionHomeHref(): string {
  return "/work";
}
