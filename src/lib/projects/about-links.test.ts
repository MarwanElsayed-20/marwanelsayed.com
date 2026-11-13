import { expect, it } from "vitest";
import { aboutPage } from "@/content/site/about";
import { resolveAboutLinks, workLinks } from "./about-links";

it("resolves each project in order to its title and case study", () => {
  const links = resolveAboutLinks(aboutPage.current.seen, workLinks);
  expect(links).toHaveLength(aboutPage.current.seen.length);
  for (const link of links) expect(link.href).toMatch(/^\/(saas-dashboards|websites-ecommerce)\//);
});

it("fails on an unknown or repeated project", () => {
  expect(() => resolveAboutLinks(["not-a-project"], workLinks)).toThrow(/unknown project/);
  expect(() => resolveAboutLinks(["aligna", "aligna"], workLinks)).toThrow(/twice/);
});
