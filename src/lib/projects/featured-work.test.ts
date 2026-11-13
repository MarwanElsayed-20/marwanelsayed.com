import { describe, expect, it } from "vitest";
import { featuredProjectSlugs } from "@/content/projects/featured";
import { MAX_FEATURED, MIN_FEATURED, featuredEntries, resolveFeatured } from "./featured-work";
import type { WorkEntry } from "./work";

const entry = (slug: string) => ({ slug, title: slug }) as WorkEntry;
const entries = ["a", "b", "c", "d"].map(entry);

describe("resolveFeatured", () => {
  it("returns entries in the owner's order", () => {
    expect(resolveFeatured(entries, ["c", "a", "b"]).map((e) => e.slug)).toEqual(["c", "a", "b"]);
  });

  it("rejects too few, too many, duplicate and unknown slugs", () => {
    expect(() => resolveFeatured(entries, ["a", "b"])).toThrow(/Feature 3 to 6/);
    expect(() => resolveFeatured(entries, ["a", "b", "c", "d", "a", "b", "c"])).toThrow(
      /Feature 3 to 6/,
    );
    expect(() => resolveFeatured(entries, ["a", "a", "b"])).toThrow(/Duplicate featured slug: a/);
    expect(() => resolveFeatured(entries, ["a", "b", "zzz"])).toThrow(/Unknown featured slug: zzz/);
  });
});

describe("the real featured set", () => {
  it("resolves to real projects with captures, within the allowed size", () => {
    expect(featuredEntries.length).toBeGreaterThanOrEqual(MIN_FEATURED);
    expect(featuredEntries.length).toBeLessThanOrEqual(MAX_FEATURED);
    expect(featuredEntries.map((e) => e.slug)).toEqual([...featuredProjectSlugs]);
    for (const featured of featuredEntries) expect(featured.image?.kind).toBe("capture");
  });
});
