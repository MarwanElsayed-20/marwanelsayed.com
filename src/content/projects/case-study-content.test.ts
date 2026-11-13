import { describe, expect, it } from "vitest";
import { buildSections } from "@/lib/projects/case-study";
import { validateProjects } from "@/lib/projects/validate";
import { digitalExperiencesProjects } from "./digital-experiences";
import { digitalProductsProjects } from "./digital-products";

const projects = [...digitalExperiencesProjects, ...digitalProductsProjects];

function expectText(text: string, min: number, max: number) {
  expect(text.trim().length).toBeGreaterThanOrEqual(min);
  expect(text.trim().length).toBeLessThanOrEqual(max);
  expect(text).not.toMatch(/http/i);
}

describe("production case-study content", () => {
  it("validates all 28 projects and meets the features-and-decisions coverage target", () => {
    expect(projects).toHaveLength(28);
    expect(
      validateProjects(digitalExperiencesProjects, "production", [
        "e-commerce",
        "landing-pages",
        "interactive-websites",
      ]),
    ).toEqual([]);
    expect(
      validateProjects(
        digitalProductsProjects,
        "production",
        ["saas-products", "dashboards"],
        "digital-products",
      ),
    ).toEqual([]);
    expect(
      projects.filter((project) => project.features?.length && project.decisions?.length).length,
    ).toBeGreaterThanOrEqual(20);
  });

  for (const project of projects) {
    it(`${project.slug}: new fields contain no http and meet the data-model limits`, () => {
      if (project.scope !== undefined) expectText(project.scope, 20, 220);
      if (project.features !== undefined) {
        expect(project.features.length).toBeGreaterThanOrEqual(1);
        expect(project.features.length).toBeLessThanOrEqual(6);
        for (const group of project.features) {
          expectText(group.title, 1, 60);
          expect(group.points.length).toBeGreaterThanOrEqual(1);
          expect(group.points.length).toBeLessThanOrEqual(5);
          for (const point of group.points) expectText(point, 1, 200);
        }
      }
      if (project.decisions !== undefined) {
        expect(project.decisions.length).toBeGreaterThanOrEqual(1);
        expect(project.decisions.length).toBeLessThanOrEqual(8);
        for (const decision of project.decisions) {
          expectText(decision.title, 1, 80);
          expectText(decision.detail, 1, 400);
        }
      }
    });
  }

  for (const [kind, records] of [
    ["digital-experiences", digitalExperiencesProjects],
    ["digital-products", digitalProductsProjects],
  ] as const) {
    for (const project of records) {
      it(`${project.slug}: every rendered section has content`, () => {
        const sections = buildSections(project, kind);
        expect(sections.length).toBeGreaterThan(0);
        for (const section of sections) {
          expect(section.title.trim()).not.toBe("");
          expect(
            section.paragraphs.length +
              section.items.length +
              section.groups.length +
              section.decisions.length +
              section.screens.length +
              section.responsive.length,
          ).toBeGreaterThan(0);
        }
      });
    }
  }
});
