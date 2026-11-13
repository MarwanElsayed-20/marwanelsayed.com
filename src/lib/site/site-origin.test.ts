import { describe, expect, it } from "vitest";
import { parseSiteOrigin, siteOrigin, siteUrlProblems } from "./site-origin";

describe("parseSiteOrigin", () => {
  it("returns the origin of an https address and drops path, query and trailing slash", () => {
    expect(parseSiteOrigin("https://studio.co.uk")).toBe("https://studio.co.uk");
    expect(parseSiteOrigin("https://studio.co.uk/")).toBe("https://studio.co.uk");
    expect(parseSiteOrigin(" https://studio.co.uk/work?a=1#x ")).toBe("https://studio.co.uk");
  });

  it.each([undefined, null, "", "   ", "studio.co.uk", "http://studio.co.uk", "ftp://x.com"])(
    "returns null for %j",
    (value) => {
      expect(parseSiteOrigin(value)).toBeNull();
    },
  );

  it("rejects credentials", () => {
    expect(parseSiteOrigin("https://user:pass@studio.co.uk")).toBeNull();
  });
});

describe("siteOrigin", () => {
  it("reads SITE_URL", () => {
    expect(siteOrigin({ SITE_URL: "https://studio.co.uk" })).toBe("https://studio.co.uk");
  });

  it("is null when SITE_URL is missing", () => {
    expect(siteOrigin({})).toBeNull();
  });

  it("never names a preview or development deployment canonical", () => {
    expect(siteOrigin({ SITE_URL: "https://studio.co.uk", VERCEL_ENV: "preview" })).toBeNull();
    expect(siteOrigin({ SITE_URL: "https://studio.co.uk", VERCEL_ENV: "development" })).toBeNull();
  });

  it("uses SITE_URL in production", () => {
    expect(siteOrigin({ SITE_URL: "https://studio.co.uk", VERCEL_ENV: "production" })).toBe(
      "https://studio.co.uk",
    );
  });
});

describe("siteUrlProblems", () => {
  it("accepts a clean public https origin", () => {
    expect(siteUrlProblems("https://studio.co.uk")).toEqual([]);
    expect(siteUrlProblems("https://studio.co.uk/")).toEqual([]);
    expect(siteUrlProblems("https://my-site.vercel.app")).toEqual([]);
  });

  it.each([undefined, null, "", "  "])("reports a missing value for %j", (value) => {
    expect(siteUrlProblems(value)).toEqual(["SITE_URL is not set."]);
  });

  it("reports an unparsable value", () => {
    expect(siteUrlProblems("not a url")).toEqual(["SITE_URL is not a valid absolute URL."]);
  });

  it.each([
    ["http://studio.co.uk", "https://"],
    ["https://studio.co.uk/work", "origin only"],
    ["https://studio.co.uk?x=1", "origin only"],
    ["https://localhost:3000", "public domain"],
    ["https://127.0.0.1", "public domain"],
    ["https://studio", "public domain"],
    ["https://portfolio.example", "reserved"],
    ["https://example.com", "reserved"],
    ["https://www.example.org", "reserved"],
    ["https://x.invalid", "reserved"],
  ])("rejects %s", (value, fragment) => {
    const problems = siteUrlProblems(value);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join(" ")).toContain(fragment);
  });
});
