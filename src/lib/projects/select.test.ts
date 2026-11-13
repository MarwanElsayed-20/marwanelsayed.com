import { describe, expect, it } from "vitest";
import type { CategoryId, Project } from "@/lib/projects/types";
import { findBySlug, groupByCategory, projectPath, sectionHomeHref } from "./select";

const ids: readonly CategoryId[] = ["e-commerce", "landing-pages", "interactive-websites"];

function project(slug: string, category: CategoryId): Project {
  return { slug, title: slug, category, summary: "Summary." };
}

describe("groupByCategory", () => {
  it("returns an empty list for no projects", () => {
    expect(groupByCategory([], ids)).toEqual([]);
  });

  it("orders groups by the category order and keeps file order inside a group", () => {
    const groups = groupByCategory(
      [
        project("c", "interactive-websites"),
        project("a", "e-commerce"),
        project("d", "interactive-websites"),
        project("b", "e-commerce"),
      ],
      ids,
    );
    expect(groups.map((group) => group.category.name)).toEqual([
      "E-commerce",
      "Interactive websites",
    ]);
    expect(groups[0].projects.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(groups[1].projects.map((p) => p.slug)).toEqual(["c", "d"]);
  });
});

describe("findBySlug and projectPath", () => {
  it("finds a project or returns undefined", () => {
    const list = [project("a", "e-commerce")];
    expect(findBySlug(list, "a")?.slug).toBe("a");
    expect(findBySlug(list, "missing")).toBeUndefined();
  });

  it("joins the base path and slug", () => {
    expect(projectPath("/websites-ecommerce", "a")).toBe("/websites-ecommerce/a");
  });
});

it("links both sections to their home anchors", () => {
  expect(sectionHomeHref()).toBe("/work");
  expect(sectionHomeHref()).toBe("/work");
});
