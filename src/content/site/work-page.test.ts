import { describe, expect, it } from "vitest";
import {
  areaSpans,
  defaultRole,
  range,
  rowRoles,
  workAreas,
  workFilters,
  workPage,
} from "./work-page";

const [products, experiences] = workAreas.map((area) => area.id);

describe("area spans", () => {
  it("number the rows each area holds the way the page shows them", () => {
    const spans = areaSpans(workAreas, [products, products, products, experiences, experiences]);
    expect(spans.map(range)).toEqual(["01–03", "04–05"]);
    expect(spans[0]).toMatchObject({ start: 1, end: 3 });
  });

  it("fail loudly when an area has no rows, its rows are apart, or a row has no area", () => {
    expect(() => areaSpans(workAreas, [products, products])).toThrow(/No rows/);
    expect(() => areaSpans(workAreas, [products, experiences, products])).toThrow(/not together/);
    expect(() => areaSpans(workAreas, [products, experiences, "elsewhere"])).toThrow(/no area/);
  });
});

describe("the page's words", () => {
  it("do not say this is everything, a directory or a full index", () => {
    const words = [
      workPage.label,
      ...workPage.heading,
      workPage.introduction,
      ...workFilters.map((f) => f.label),
    ];
    expect(words.join(" ")).not.toMatch(
      /\b(all the work|every project|full|directory|index|complete)\b/i,
    );
  });

  it("name no employer or place of work", () => {
    expect(JSON.stringify({ workPage, workAreas, rowRoles, defaultRole })).not.toMatch(
      /webelocity|fivem|freelanc/i,
    );
  });

  it("keep the two areas the project is built around, and a filter for each", () => {
    expect(workFilters.map((filter) => filter.value)).toEqual([
      "all",
      "websites-ecommerce",
      "saas-dashboards",
    ]);
  });
});
