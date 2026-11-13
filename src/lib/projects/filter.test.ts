import { expect, it } from "vitest";
import { workOrder, productLabels } from "@/content/projects/work-order";
import { projects, productProjects } from "./repository";
import { buildWorkEntries } from "./work";
import { filterEntries, isWorkFilter, visibleCount, INITIAL_VISIBLE_WORK } from "./filter";
const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
it("filters without reordering and restores All", () => {
  expect(filterEntries(entries, "all")).toEqual(entries);
  expect(filterEntries(entries, "websites-ecommerce")).toEqual(
    entries.filter((entry) => entry.section === "digital-experiences"),
  );
  expect(filterEntries(entries, "saas-dashboards")).toEqual(
    entries.filter((entry) => entry.section === "digital-products"),
  );
});
it("recognises only real filter values", () => {
  expect(isWorkFilter("saas-dashboards")).toBe(true);
  expect(isWorkFilter("all")).toBe(true);
  expect(isWorkFilter("freelance")).toBe(false);
  expect(isWorkFilter("experiments")).toBe(false);
  expect(isWorkFilter(undefined)).toBe(false);
});
it("limits long lists, reveals the rest and handles short and empty lists", () => {
  expect(INITIAL_VISIBLE_WORK).toBe(8);
  expect(visibleCount(entries, false)).toBe(8);
  expect(visibleCount(entries, true)).toBe(28);
  expect(visibleCount(entries.slice(0, 3), false)).toBe(3);
  expect(visibleCount([], false)).toBe(0);
});
