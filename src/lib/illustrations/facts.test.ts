import { expect, it } from "vitest";
import { validateFacts } from "./validate-facts";
import type { IllustrationFacts } from "./types";
const fact: IllustrationFacts = {
  slug: "test",
  kind: "reconstruction",
  method: { reason: "Local source defines this screen", sources: ["Source layout"] },
  layout: "orders-table",
  palette: [
    { role: "ink", hex: "#23201f", source: "Theme ink" },
    { role: "surface", hex: "#ffffff", source: "Theme surface" },
    { role: "accent", hex: "#ee7531", source: "Theme accent" },
  ],
  type: { family: "Onest", status: "not-reproduced", source: "Font configuration" },
  screenName: "Orders",
  texts: [
    { text: "Test", role: "name", source: "Project title" },
    { text: "Orders", role: "nav", source: "Navigation" },
  ],
  sampleContent: "bars-only",
};
export const fixture = () => structuredClone(fact);
it("accepts sourced facts with a fallback font", () =>
  expect(validateFacts([fixture()])).toEqual([]));
it.each(["screenshot", "sample", "illustration", "reconstruction", "mock"])(
  "rejects drawn disclosure word %s",
  (word) => {
    const f = fixture();
    f.texts[0].text = word;
    expect(validateFacts([f]).join(" ")).toMatch(/texts/);
  },
);
it("requires text provenance, including for digits", () => {
  const f = fixture();
  f.texts[1] = { text: "Orders 2", role: "nav", source: "" };
  expect(validateFacts([f]).join(" ")).toMatch(/source/);
  f.texts[1].source = "Navigation source";
  expect(validateFacts([f])).toEqual([]);
});
it("rejects duplicate layout families", () => {
  const f = fixture();
  expect(validateFacts([f, { ...f, slug: "other" }]).join(" ")).toMatch(/layout/);
});
it("requires valid sourced hex colours", () => {
  const f = fixture();
  f.palette[0] = { role: "ink", hex: "blue", source: "" };
  const errors = validateFacts([f]).join(" ");
  expect(errors).toMatch(/hex/);
  expect(errors).toMatch(/source/);
});
it("requires a repository font with its licence before claiming reproduction", () => {
  const f = fixture();
  f.type = { family: "Missing", status: "reproduced", source: "Font config" };
  expect(validateFacts([f]).join(" ")).toMatch(/font|licen/i);
  f.type.family = "Inter";
  expect(validateFacts([f])).toEqual([]);
});
it("reports errors without throwing", () => {
  const f = fixture();
  f.method.reason = "";
  f.screenName = "";
  expect(() => validateFacts([f])).not.toThrow();
  expect(validateFacts([f]).length).toBeGreaterThan(0);
});
