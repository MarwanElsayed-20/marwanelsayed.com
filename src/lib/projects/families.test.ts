import { describe, expect, it } from "vitest";
import { families, type ProductFamily } from "@/content/projects/families";
import { productLabels, workOrder } from "@/content/projects/work-order";
import { buildFamilies, familyFor } from "./families";
import { buildWorkEntries } from "./work";
import { projects, productProjects } from "./repository";

const example: ProductFamily = {
  id: "example",
  name: "Example",
  members: [
    { slug: "a", part: "First" },
    { slug: "b", part: "Second" },
  ],
};
const validate = (input: readonly ProductFamily[]) =>
  buildFamilies(input, ["a", "b", "c", "d"], ["a", "b", "c", "d"]);

describe("family validation", () => {
  it("accepts valid input without changing its order or content", () => {
    expect(validate([example])).toEqual([example]);
  });
  it.each([
    { ...example, members: [] },
    { ...example, members: example.members.slice(0, 1) },
    { ...example, members: Array(6).fill(example.members[0]) },
    { ...example, id: "Bad id" },
    { ...example, id: "" },
    { ...example, name: " " },
    { ...example, name: "x".repeat(41) },
    { ...example, name: "HTTP link" },
    { ...example, story: [] },
    { ...example, story: ["a", "b", "c", "d"] },
    ...["", " ", "x".repeat(401), "HTTP link", "<b>story</b>"].map((story) => ({
      ...example,
      story: [story],
    })),
    ...["", " ", "x".repeat(41), "http"].map((part) => ({
      ...example,
      members: [{ slug: "a", part }, example.members[1]],
    })),
  ])("rejects invalid text/counts with family and member context: %j", (family) => {
    expect(() => validate([family])).toThrow(/Family .*slug/);
  });
  it("rejects unknown, duplicate, separated and reversed members by slug", () => {
    for (const slug of ["unknown", "a", "c"])
      expect(() =>
        validate([{ ...example, members: [example.members[0], { slug, part: "Other" }] }]),
      ).toThrow(new RegExp(`Example.*slug ${slug}`));
    expect(() => validate([{ ...example, members: [...example.members].reverse() }])).toThrow(
      /slug a.*consecutive/,
    );
    expect(() => buildFamilies([example], ["a"], ["a", "b"])).toThrow(/slug b.*consecutive/);
    expect(() => validate([example, { ...example, id: "other" }])).toThrow(
      /slug a.*duplicate member/,
    );
    expect(() => validate([example, example])).toThrow(/duplicate family id/);
  });
  it("accepts the maximum text, paragraph and member limits", () => {
    const slugs = ["a", "b", "c", "d", "e"];
    expect(() =>
      buildFamilies(
        [
          {
            ...example,
            name: "x".repeat(40),
            story: Array(3).fill("x".repeat(400)),
            members: slugs.map((slug) => ({ slug, part: "x".repeat(40) })),
          },
        ],
        slugs,
        slugs,
      ),
    ).not.toThrow();
  });
});

it("resolves all twelve members from existing Work entries and marks only the current page", () => {
  const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
  expect(
    buildFamilies(
      families,
      workOrder,
      entries.map((e) => e.slug),
    ),
  ).toBe(families);
  expect(families.flatMap((f) => f.members)).toHaveLength(12);
  for (const family of families)
    for (const member of family.members) {
      const view = familyFor(member.slug)!;
      expect(view.name).toBe(family.name);
      expect(view.story).toEqual(family.story);
      expect(view.members.map((m) => m.slug)).toEqual(family.members.map((m) => m.slug));
      expect(view.members.filter((m) => m.current).map((m) => m.slug)).toEqual([member.slug]);
      for (const item of view.members) {
        const entry = entries.find((e) => e.slug === item.slug)!;
        expect(item).toMatchObject({ title: entry.title, href: entry.href, image: entry.image });
      }
    }
  expect(familyFor("wajihni")).toBeUndefined();
  expect(familyFor("not-a-project")).toBeUndefined();
});
