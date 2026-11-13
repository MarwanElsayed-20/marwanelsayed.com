import { expect, it } from "vitest";
import { families } from "./families";
import { productLabels, workOrder } from "./work-order";
import { buildFamilies, familyFor } from "@/lib/projects/families";

const originalLabels: Readonly<Record<string, string>> = {
  "toolswift-customer-dashboard": "ToolSwift",
  "toolswift-admin-platform": "ToolSwift",
  "toolswift-marketing": "ToolSwift",
  "smooth-erp": "Smooth ERP",
  "smooth-erp-landing-pages": "Smooth ERP",
  "hemex-dashboards": "Hemex",
  "hemex-landing-page": "Hemex",
  "camufacturing-dashboard": "Camufacturing",
  "camufacturing-site": "Camufacturing",
  "falcons-gt-motors": "FalconsGT",
  "falconsgt-sml": "FalconsGT",
  "falconsgt-luxury": "FalconsGT",
};

it("validates the five real families and preserves exactly the twelve labels", () => {
  expect(buildFamilies(families, workOrder, workOrder)).toBe(families);
  expect(families).toHaveLength(5);
  expect(productLabels).toEqual(originalLabels);
  expect(families.flatMap((family) => family.members.map((member) => member.slug))).toEqual(
    Object.keys(originalLabels),
  );
  const nonMembers = workOrder.filter((slug) => !(slug in originalLabels));
  expect(nonMembers).toHaveLength(16);
  for (const slug of nonMembers) expect(familyFor(slug)).toBeUndefined();
  expect(familyFor("falcon-translation-dashboard")).toBeUndefined();
});

it("keeps stories and part labels within limits", () => {
  for (const family of families) {
    expect(family.story?.length ?? 0).toBeLessThanOrEqual(3);
    for (const paragraph of family.story ?? []) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
      expect(paragraph.length).toBeLessThanOrEqual(400);
      expect(paragraph).not.toMatch(/http|<[^>]*>/i);
    }
    for (const member of family.members) {
      expect(member.part.trim().length).toBeGreaterThan(0);
      expect(member.part.length).toBeLessThanOrEqual(40);
    }
  }
});
