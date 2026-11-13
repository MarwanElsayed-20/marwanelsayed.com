import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featuredProjectSlugs } from "@/content/projects/featured";
import type { SelectedWorkScene } from "@/content/site/selected-work";
import { sceneTones } from "@/lib/contrast";
import { resolveScenes, selectedScenes } from "./selected-work";
import type { BaseProject, ProjectImage } from "./types";

const capture = (src: string): ProjectImage => ({
  src,
  width: 10,
  height: 10,
  alt: "Capture",
  kind: "capture",
});
const records = [
  { slug: "a", image: capture("/a/card.png"), screens: [capture("/a/1.png")] },
  { slug: "b", image: capture("/b/card.png") },
] as unknown as (BaseProject & { screens?: readonly ProjectImage[] })[];
const hrefs = new Map([
  ["a", "/saas-dashboards/a"],
  ["b", "/saas-dashboards/b"],
]);
const scene = (id: string, overrides: Partial<SelectedWorkScene> = {}) =>
  ({
    id,
    name: id,
    tab: id,
    label: ["Client", "Kind"],
    summary: "Summary",
    links: [{ label: "Read case study", project: "a" }],
    captures: [
      { project: "a", src: "/a/1.png" },
      { project: "b", src: "/b/card.png" },
    ],
    captions: { topic: "Topic", flow: "Flow" },
    ...overrides,
  }) as SelectedWorkScene;

describe("resolveScenes", () => {
  it("numbers scenes and resolves links and captures from the records", () => {
    const [first, , third] = resolveScenes([scene("x"), scene("y"), scene("z")], records, hrefs);
    expect(first.number).toBe("01");
    expect(third.number).toBe("03");
    expect(first.links).toEqual([{ label: "Read case study", href: "/saas-dashboards/a" }]);
    expect(first.captures.map((image) => image.src)).toEqual(["/a/1.png", "/b/card.png"]);
  });

  it("rejects bad counts, duplicates, unknown projects and missing captures", () => {
    expect(() => resolveScenes([scene("x"), scene("y")], records, hrefs)).toThrow(/3 to 6/);
    expect(() => resolveScenes([scene("x"), scene("x"), scene("y")], records, hrefs)).toThrow(
      /Duplicate scene: x/,
    );
    const unknownLink = scene("z", { links: [{ label: "Read", project: "nope" }] });
    expect(() => resolveScenes([scene("x"), scene("y"), unknownLink], records, hrefs)).toThrow(
      /unknown project: nope/,
    );
    const missing = scene("z", {
      captures: [
        { project: "a", src: "/a/9.png" },
        { project: "b", src: "/b/card.png" },
      ],
    });
    expect(() => resolveScenes([scene("x"), scene("y"), missing], records, hrefs)).toThrow(
      /has no capture \/a\/9.png/,
    );
    const single = scene("z", { captures: [{ project: "a", src: "/a/1.png" }] });
    expect(() => resolveScenes([scene("x"), scene("y"), single], records, hrefs)).toThrow(
      /needs two captures/,
    );
  });
});

describe("the real Selected work", () => {
  it("shows the four owner-chosen scenes, each with its own colour tokens", () => {
    expect(selectedScenes.map((s) => s.id)).toEqual([
      "toolswift",
      "smooth-erp",
      "aligna",
      "wajihni",
    ]);
    for (const s of selectedScenes) expect(sceneTones).toContain(s.id);
  });

  it("presents ToolSwift as its family, with one link per part", () => {
    expect(selectedScenes[0].links.map((link) => link.href)).toEqual([
      "/saas-dashboards/toolswift-customer-dashboard",
      "/saas-dashboards/toolswift-admin-platform",
      "/websites-ecommerce/toolswift-marketing",
    ]);
  });

  it("links every other scene to its case study only, never to an outside address", () => {
    for (const s of selectedScenes.slice(1)) {
      expect(s.links).toHaveLength(1);
      expect(s.links[0].label).toBe("Read case study");
    }
    for (const s of selectedScenes)
      for (const link of s.links) expect(link.href.startsWith("/")).toBe(true);
  });

  it("uses captures that exist on disk", () => {
    for (const s of selectedScenes)
      for (const image of s.captures)
        expect(existsSync(join(process.cwd(), "public", image.src)), image.src).toBe(true);
  });

  it("matches the featured projects (the menu lists them) to each scene's first link", () => {
    expect(selectedScenes.map((s) => s.links[0].href.split("/").pop())).toEqual([
      ...featuredProjectSlugs,
    ]);
  });
});
