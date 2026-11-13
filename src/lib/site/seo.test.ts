import { describe, expect, it } from "vitest";
import { buildRobots, buildSitemap } from "./seo";

describe("buildRobots", () => {
  it("closes previews to crawlers and advertises no sitemap", () => {
    expect(buildRobots({ VERCEL_ENV: "preview", SITE_URL: "https://studio.co.uk" })).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows crawling and omits the sitemap line when there is no origin", () => {
    expect(buildRobots({})).toEqual({ rules: { userAgent: "*", allow: "/" } });
  });

  it("points to the sitemap when a valid origin exists", () => {
    expect(buildRobots({ SITE_URL: "https://studio.co.uk/", VERCEL_ENV: "production" })).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://studio.co.uk/sitemap.xml",
    });
  });

  it("never disallows anything in production", () => {
    const robots = buildRobots({ SITE_URL: "https://studio.co.uk", VERCEL_ENV: "production" });
    expect(robots.rules.disallow).toBeUndefined();
  });
});

describe("buildSitemap", () => {
  it("is empty without an origin", () => {
    expect(buildSitemap(null, ["/", "/websites-ecommerce/example"])).toEqual([]);
  });

  it("lists absolute addresses in order without duplicates", () => {
    expect(
      buildSitemap("https://studio.co.uk", [
        "/",
        "/websites-ecommerce/example",
        "/websites-ecommerce/example",
        "/work/one",
      ]),
    ).toEqual([
      { url: "https://studio.co.uk/" },
      { url: "https://studio.co.uk/websites-ecommerce/example" },
      { url: "https://studio.co.uk/work/one" },
    ]);
  });
});
