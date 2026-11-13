import { describe, expect, it } from "vitest";
import { categories, digitalExperiences, digitalProducts } from "@/config/projects";
import { indexablePaths, isListingIndexable } from "./indexing";
import { findBySlug, groupByCategory } from "./select";
import type { ProductProject, Project } from "./types";

const product = (
  slug: string,
  category: ProductProject["category"],
  sample = false,
): ProductProject => ({
  slug,
  title: `Product ${slug}`,
  category,
  summary: "S.",
  ...(sample ? { sample: true as const } : {}),
});

const experience = (slug: string, sample = false): Project => ({
  slug,
  title: `Experience ${slug}`,
  category: "e-commerce",
  summary: "S.",
  ...(sample ? { sample: true as const } : {}),
});

describe("section configuration", () => {
  it("gives each section its own categories, path, and copy", () => {
    expect(digitalProducts.basePath).toBe("/saas-dashboards");
    expect(digitalProducts.categoryIds).toEqual(["saas-products", "dashboards"]);
    const shared = digitalProducts.categoryIds.filter((id) =>
      digitalExperiences.categoryIds.includes(id),
    );
    expect(shared).toEqual([]);
    expect(digitalProducts.empty.heading).not.toBe(digitalExperiences.empty.heading);
    expect(digitalProducts.intro).not.toBe(digitalExperiences.intro);
    expect(categories["saas-products"].name).toBe("SaaS products");
    expect(categories.dashboards.name).toBe("Dashboards");
  });

  it("crops Websites & E-commerce card images and shows SaaS & Dashboards card images whole", () => {
    expect(digitalExperiences.cardImageFit).toBe("cover");
    expect(digitalProducts.cardImageFit).toBe("contain");
  });
});

describe("selection with product categories", () => {
  it("groups in the fixed order and hides empty categories", () => {
    const list = [
      product("b", "dashboards"),
      product("a", "saas-products"),
      product("c", "dashboards"),
    ];
    const groups = groupByCategory(list, digitalProducts.categoryIds);
    expect(groups.map((group) => group.category.name)).toEqual(["SaaS products", "Dashboards"]);
    expect(groups[1].projects.map((item) => item.slug)).toEqual(["b", "c"]);
    expect(groupByCategory([product("a", "dashboards")], digitalProducts.categoryIds)).toHaveLength(
      1,
    );
    expect(groupByCategory([], digitalProducts.categoryIds)).toEqual([]);
  });

  it("finds a product by slug and keeps its type", () => {
    const found = findBySlug([product("a", "dashboards")], "a");
    expect(found?.category).toBe("dashboards");
    expect(findBySlug([product("a", "dashboards")], "missing")).toBeUndefined();
  });
});

describe("indexing is decided per section", () => {
  it("is not indexable with no products or only review products", () => {
    expect(isListingIndexable([])).toBe(false);
    expect(indexablePaths(digitalProducts, [])).toEqual([]);
    expect(indexablePaths(digitalProducts, [product("a", "dashboards", true)])).toEqual([]);
  });

  it("becomes indexable with one real product and lists the listing and each real product", () => {
    const list = [product("a", "dashboards"), product("b", "saas-products", true)];
    expect(isListingIndexable(list)).toBe(true);
    expect(indexablePaths(digitalProducts, list)).toEqual(["/saas-dashboards/a"]);
  });

  it("never lets one section change the other's decision", () => {
    const realExperience = [experience("e")];
    expect(isListingIndexable(realExperience)).toBe(true);
    expect(isListingIndexable([])).toBe(false);
    expect(indexablePaths(digitalExperiences, realExperience)).toEqual(["/websites-ecommerce/e"]);
    expect(indexablePaths(digitalProducts, [])).toEqual([]);
  });
});
