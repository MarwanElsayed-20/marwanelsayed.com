import { describe, expect, it } from "vitest";
import { digitalExperiences } from "@/config/projects";
import { sampleProjects } from "@/content/projects/samples";
import { validateProjects } from "./validate";

describe("review sample data", () => {
  it("is valid sample data", () => {
    expect(validateProjects(sampleProjects, "sample", digitalExperiences.categoryIds)).toEqual([]);
  });

  it("marks every record as sample and uses no links", () => {
    expect(sampleProjects.every((project) => project.sample === true)).toBe(true);
    expect(sampleProjects.some((project) => project.liveLink !== undefined)).toBe(false);
  });

  it("covers every category and the cases the review pages need", () => {
    const categories = new Set(sampleProjects.map((project) => project.category));
    expect(categories).toEqual(new Set(digitalExperiences.categoryIds));
    const bySlug = Object.fromEntries(sampleProjects.map((project) => [project.slug, project]));
    expect(bySlug["sample-full"].builtWith?.length).toBeGreaterThan(0);
    expect(bySlug["sample-minimal"].image).toBeUndefined();
    expect(bySlug["sample-offline"].status).toBe("offline");
    expect(bySlug["sample-no-image"].image).toBeUndefined();
    expect(bySlug["sample-long"].title.length).toBeGreaterThan(60);
  });
});
