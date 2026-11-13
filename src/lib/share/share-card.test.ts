import { expect, it } from "vitest";
import { projects, productProjects } from "@/lib/projects/repository";
import { SHARE_LINE_LIMIT, SHARE_SIZE, shareCapture, shareCardText } from "./share-card";

it("preserves real titles and only returns the allowed text fields", () => {
  for (const { title } of [...projects, ...productProjects]) {
    const card = shareCardText({ ownerName: "Owner", title, sectionLabel: "SaaS & Dashboards" });
    expect(card.title).toBe(title);
    expect(card.title.length).toBeLessThanOrEqual(72);
    expect(card.alt).toBe(title);
    expect(Object.keys(card)).toEqual(["ownerName", "title", "sectionLabel", "alt"]);
  }
  expect(SHARE_SIZE).toEqual({ width: 1200, height: 630 });
});
it("omits the home label and shortens long titles at a word boundary", () => {
  const title = "A considered interface ".repeat(12).trim();
  const card = shareCardText({ ownerName: "Owner", title });
  expect(card).not.toHaveProperty("sectionLabel");
  expect(card.title.length).toBeLessThanOrEqual(72);
  expect(card.title).toMatch(/…$/);
  expect(title.startsWith(card.title.slice(0, -1))).toBe(true);
  expect(card.alt).toBe(title);
});
it("shows every project summary whole and leaves out a line that would be cut", () => {
  for (const { summary } of [...projects, ...productProjects]) {
    expect(shareCardText({ ownerName: "Owner", title: "T", line: summary }).line).toBe(summary);
  }
  const long = "x".repeat(SHARE_LINE_LIMIT + 1);
  expect(shareCardText({ ownerName: "Owner", title: "T", line: long })).not.toHaveProperty("line");
});
it("uses only real captures from the project's own folder, and holds back flagged covers", () => {
  const capture = (slug: string, src: string, kind?: "capture" | "illustration") => ({
    slug,
    image: { src, width: 1600, height: 1000, alt: "Capture", ...(kind ? { kind } : {}) },
  });
  expect(shareCapture(capture("aligna", "/projects/aligna/card.png", "capture"))).toBe(
    "/projects/aligna/card.png",
  );
  expect(shareCapture(capture("aligna", "/projects/aligna/card.png", "illustration"))).toBe(
    undefined,
  );
  expect(shareCapture(capture("aligna", "/projects/aligna/card.png"))).toBe(undefined);
  expect(shareCapture(capture("aligna", "/projects/wajihni/card.png", "capture"))).toBe(undefined);
  expect(shareCapture(capture("aligna", "/projects/aligna/../card.png", "capture"))).toBe(
    undefined,
  );
  expect(shareCapture({ slug: "aligna" })).toBe(undefined);
  for (const slug of ["amherst-supply"]) {
    const project = [...projects, ...productProjects].find((entry) => entry.slug === slug)!;
    expect(project.image?.kind).toBe("capture");
    expect(shareCapture(project)).toBe(undefined);
  }
  const shared = [...projects, ...productProjects].filter((project) => shareCapture(project));
  expect(shared).toHaveLength(27);
});
