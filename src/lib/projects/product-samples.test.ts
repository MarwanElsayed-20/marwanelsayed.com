import { describe, expect, it } from "vitest";
import { digitalProducts } from "@/config/projects";
import { sampleProducts } from "@/content/projects/product-samples";
import { validateProjects } from "./validate";

const bySlug = Object.fromEntries(sampleProducts.map((project) => [project.slug, project]));

describe("review sample products", () => {
  it("is valid sample data", () => {
    expect(
      validateProjects(sampleProducts, "sample", digitalProducts.categoryIds, "digital-products"),
    ).toEqual([]);
  });

  it("marks every record as sample, uses no links, and uses generic titles", () => {
    expect(sampleProducts.every((project) => project.sample === true)).toBe(true);
    expect(sampleProducts.some((project) => project.liveLink !== undefined)).toBe(false);
    expect(sampleProducts.every((project) => project.title.startsWith("Sample product"))).toBe(
      true,
    );
  });

  it("covers both categories and the cases the review pages need", () => {
    const categories = new Set(sampleProducts.map((project) => project.category));
    expect(categories).toEqual(new Set(digitalProducts.categoryIds));
    const full = bySlug["sample-product-full"];
    expect(full.productContext?.length).toBeGreaterThan(0);
    expect(full.usersAndProblems?.length).toBeGreaterThan(0);
    expect(full.workflows?.length).toBeGreaterThan(0);
    expect(full.designDecisions?.length).toBeGreaterThan(0);
    expect(full.role?.length).toBeGreaterThan(0);
    expect(full.outcomes?.length).toBeGreaterThan(0);
    expect(full.builtWith?.length).toBeGreaterThan(0);
    expect(full.screens?.length).toBe(3);
    expect(bySlug["sample-product-screens"].screens).toHaveLength(6);
    expect(bySlug["sample-product-minimal"].image).toBeUndefined();
    expect(bySlug["sample-product-offline"].status).toBe("offline");
    expect(bySlug["sample-product-no-image"].image).toBeUndefined();
    expect(bySlug["sample-product-long"].title.length).toBeGreaterThan(60);
  });

  it("includes a wide, dense dashboard-like image and a tall narrow screen", () => {
    const primary = bySlug["sample-product-full"].image;
    expect(primary).toBeDefined();
    expect((primary?.width ?? 0) / (primary?.height ?? 1)).toBeGreaterThan(1.5);
    const tallest = Math.max(
      ...sampleProducts.flatMap((project) =>
        (project.screens ?? []).map((s) => s.height / s.width),
      ),
    );
    expect(tallest).toBeGreaterThan(1.5);
  });
});
