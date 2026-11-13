import type { SectionId } from "./types";

/** What the Work index can narrow to: everything, or one of the two areas of work. */
export type WorkFilter = "all" | "websites-ecommerce" | "saas-dashboards";
export const INITIAL_VISIBLE_WORK = 8;

const filterValues: readonly string[] = ["all", "websites-ecommerce", "saas-dashboards"];

export function isWorkFilter(value: unknown): value is WorkFilter {
  return typeof value === "string" && filterValues.includes(value);
}

export function matchesFilter(item: { section: SectionId }, filter: WorkFilter): boolean {
  return (
    filter === "all" ||
    item.section === (filter === "websites-ecommerce" ? "digital-experiences" : "digital-products")
  );
}

export function filterEntries<T extends { section: SectionId }>(
  items: readonly T[],
  filter: WorkFilter,
): T[] {
  return items.filter((item) => matchesFilter(item, filter));
}

export function visibleCount(filtered: readonly unknown[], expanded: boolean): number {
  return expanded ? filtered.length : Math.min(INITIAL_VISIBLE_WORK, filtered.length);
}
