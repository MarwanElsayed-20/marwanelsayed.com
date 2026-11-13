import { expect, it } from "vitest";
import { illustrationFacts } from "./index";
import { digitalExperiencesProjects } from "../projects/digital-experiences";
import { digitalProductsProjects } from "../projects/digital-products";
import { validateFacts } from "../../lib/illustrations/validate-facts";

it("has no generated illustrations left", () => {
  expect(illustrationFacts).toHaveLength(0);
  expect(validateFacts(illustrationFacts)).toEqual([]);
});

it("uses a capture for every card image and every screen", () => {
  for (const project of [...digitalExperiencesProjects, ...digitalProductsProjects]) {
    expect(project.image?.kind, project.slug).toBe("capture");
    for (const screen of project.screens ?? []) expect(screen.kind, project.slug).toBe("capture");
  }
});
