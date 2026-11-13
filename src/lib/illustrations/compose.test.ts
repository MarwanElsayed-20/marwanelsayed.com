import { expect, it } from "vitest";
import { composeIllustration } from "./compose";
import type { IllustrationFacts } from "./types";
const facts: IllustrationFacts = {
  slug: "test",
  kind: "illustration",
  method: { reason: "Test", sources: ["Source"] },
  layout: "orders-table",
  palette: [
    { role: "ink", hex: "#23201f", source: "Theme" },
    { role: "surface", hex: "#ffffff", source: "Theme" },
    { role: "accent", hex: "#ee7531", source: "Theme" },
  ],
  type: { family: "Onest", status: "not-reproduced", source: "Config" },
  screenName: "Orders",
  texts: [
    { text: "Project", role: "name", source: "Title" },
    { text: "Orders", role: "nav", source: "Navigation" },
  ],
  sampleContent: "bars-only",
};
it.each(["orders-table", "erp-pos", "services-home", "catalog-grid", "analytics-tiles"] as const)(
  "composes a deterministic, offline %s canvas with sourced, readable text",
  (layout) => {
    const input = { ...facts, layout };
    const result = composeIllustration(input);
    expect(composeIllustration(input)).toEqual(result);
    const doc = new DOMParser().parseFromString(result.html, "text/html");
    const canvas = doc.querySelector("main")!;
    expect(canvas.getAttribute("style")).toContain("width:1600px");
    expect(canvas.getAttribute("style")).toContain("height:1000px");
    expect(result.texts.length).toBeGreaterThan(0);
    for (const drawn of result.texts) {
      expect(facts.texts.map((f) => f.text)).toContain(drawn.text);
      expect(drawn.fontSizePx).toBeGreaterThanOrEqual(44);
      expect(drawn.text).not.toMatch(/screenshot|sample|illustration|reconstruction|mock|\d/i);
    }
    expect(Array.from(doc.querySelectorAll("[data-text]")).map((el) => el.textContent)).toEqual(
      result.texts.map((t) => t.text),
    );
    expect(result.html).not.toMatch(/https?:|file:|<img|<svg|logo/i);
    expect(canvas.textContent).toBe(result.texts.map((t) => t.text).join(""));
  },
);
it("escapes sourced text and does not allow HTML injection", () => {
  const result = composeIllustration({
    ...facts,
    texts: [{ text: 'A <script> & "name"', role: "name", source: "Name" }],
  });
  const doc = new DOMParser().parseFromString(result.html, "text/html");
  expect(doc.querySelector("script")).toBeNull();
  expect(doc.querySelector("main")?.textContent).toBe('A <script> & "name"');
});
