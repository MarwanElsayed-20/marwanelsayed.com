import { describe, expect, it } from "vitest";
import { buildPageRegistry, sitemapPaths } from "./site-pages";
import { projects, productProjects } from "./projects/repository";
describe("single-page registry", () => {
  it("registers home, Work, Services and About as indexable pages with portfolio metadata", () => {
    const entries = buildPageRegistry({ siteName: "Studio" });
    expect(entries.map((entry) => [entry.id, entry.path, entry.index])).toEqual([
      ["home", "/", true],
      ["work", "/work", true],
      ["services", "/services", true],
      ["about", "/about", true],
    ]);
    expect(entries[0]).toMatchObject({
      id: "home",
      path: "/",
      title: { absolute: "Studio | Front-end engineer" },
      index: true,
    });
    expect(entries[0].description).toContain("websites, online stores and web applications");
  });
  it("lists the pages and every real detail URL, without section roots", () => {
    expect(sitemapPaths()).toEqual([
      "/",
      "/work",
      "/services",
      "/about",
      ...["online-stores", "websites", "dashboards", "saas-erp"].map((id) => `/services/${id}`),
      ...projects.map((p) => `/websites-ecommerce/${p.slug}`),
      ...productProjects.map((p) => `/saas-dashboards/${p.slug}`),
    ]);
  });
});
