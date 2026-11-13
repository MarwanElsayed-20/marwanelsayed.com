import { describe, expect, it } from "vitest";
import { digitalProducts } from "@/config/projects";
import { digitalProductsProjects } from "@/content/projects/digital-products";
import { productProjects } from "./repository";
import { validateProjects } from "./validate";

describe("production product data", () => {
  it("is valid", () => {
    expect(
      validateProjects(
        digitalProductsProjects,
        "production",
        digitalProducts.categoryIds,
        "digital-products",
      ),
    ).toEqual([]);
  });

  it("contains no review records", () => {
    expect(digitalProductsProjects.some((project) => project.sample !== undefined)).toBe(false);
  });

  it("is exposed unchanged by the repository", () => {
    expect(productProjects).toBe(digitalProductsProjects);
  });
});
