import { describe, expect, it } from "vitest";
import { digitalExperiences } from "@/config/projects";
import type { Project } from "@/lib/projects/types";
import { indexablePaths, isListingIndexable } from "./indexing";

const real: Project = {
  slug: "real-one",
  title: "Real one",
  category: "e-commerce",
  summary: "S.",
};
const sampleProject: Project = {
  slug: "sample-one",
  title: "Sample one",
  category: "e-commerce",
  summary: "S.",
  sample: true,
};

describe("listing indexing rule", () => {
  it("is not indexable with no projects", () => {
    expect(isListingIndexable([])).toBe(false);
    expect(indexablePaths(digitalExperiences, [])).toEqual([]);
  });

  it("is not indexable with only sample projects", () => {
    expect(isListingIndexable([sampleProject])).toBe(false);
    expect(indexablePaths(digitalExperiences, [sampleProject])).toEqual([]);
  });

  it("becomes indexable as soon as one real project exists", () => {
    expect(isListingIndexable([real])).toBe(true);
    expect(indexablePaths(digitalExperiences, [real, sampleProject])).toEqual([
      "/websites-ecommerce/real-one",
    ]);
  });

  it("always agrees: the robots decision and the sitemap paths are never contradictory", () => {
    for (const list of [[], [sampleProject], [real], [real, sampleProject]]) {
      expect(isListingIndexable(list)).toBe(indexablePaths(digitalExperiences, list).length > 0);
    }
  });
});
