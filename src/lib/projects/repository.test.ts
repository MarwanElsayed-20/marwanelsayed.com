import { describe, expect, it } from "vitest";
import { digitalExperiences } from "@/config/projects";
import { digitalExperiencesProjects } from "@/content/projects/digital-experiences";
import { projects } from "./repository";
import { validateProjects } from "./validate";

describe("production project data", () => {
  it("is valid", () => {
    expect(
      validateProjects(digitalExperiencesProjects, "production", digitalExperiences.categoryIds),
    ).toEqual([]);
  });

  it("contains no sample records", () => {
    expect(digitalExperiencesProjects.some((project) => project.sample !== undefined)).toBe(false);
  });

  it("is exposed unchanged by the repository", () => {
    expect(projects).toBe(digitalExperiencesProjects);
  });
});
