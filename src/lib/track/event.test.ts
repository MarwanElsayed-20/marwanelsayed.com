import { describe, expect, it } from "vitest";
import {
  browserLabel,
  cleanDetail,
  countryCode,
  isBot,
  isCaseStudyPath,
  parseVisitSignal,
  referrerHost,
  visitEndpoint,
} from "./event";

describe("parseVisitSignal", () => {
  it("accepts a known kind and a site path, keeping only the referrer's host", () => {
    expect(
      parseVisitSignal({
        kind: "cv_download",
        path: "/about",
        referrer: "https://www.linkedin.com/in/someone?trk=x",
      }),
    ).toEqual({ kind: "cv_download", path: "/about", referrer: "linkedin.com", detail: "" });
  });

  it("accepts page views", () => {
    expect(parseVisitSignal({ kind: "page_view", path: "/work" })).toEqual({
      kind: "page_view",
      path: "/work",
      referrer: "",
      detail: "",
    });
  });

  it("drops anything else", () => {
    expect(parseVisitSignal(null)).toBeNull();
    expect(parseVisitSignal([])).toBeNull();
    expect(parseVisitSignal({ kind: "click", path: "/" })).toBeNull();
    expect(parseVisitSignal({ kind: "cv_download", path: "https://evil.test" })).toBeNull();
    expect(parseVisitSignal({ kind: "cv_download", path: "//evil.test" })).toBeNull();
    expect(parseVisitSignal({ kind: "cv_download", path: "/<script>" })).toBeNull();
    expect(parseVisitSignal({ kind: "cv_download", path: `/${"a".repeat(250)}` })).toBeNull();
  });
});

describe("referrerHost", () => {
  it("is empty for a missing or broken referrer", () => {
    expect(referrerHost("")).toBe("");
    expect(referrerHost(undefined)).toBe("");
    expect(referrerHost("not a url")).toBe("");
    expect(referrerHost("https://Google.com/search?q=marwan")).toBe("google.com");
  });
});

describe("countryCode", () => {
  it("keeps a two-letter code only", () => {
    expect(countryCode("qa")).toBe("QA");
    expect(countryCode("XYZ")).toBe("");
    expect(countryCode(null)).toBe("");
  });
});

describe("isBot", () => {
  it("treats crawlers, previews, scripts and a missing agent as bots", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("LinkedInBot/1.0")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/120")).toBe(true);
    expect(isBot("curl/8.0")).toBe(true);
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1")).toBe(
      false,
    );
  });
});

describe("isCaseStudyPath", () => {
  const bases = ["/websites-ecommerce", "/saas-dashboards"];
  it("matches one slug under a section", () => {
    expect(isCaseStudyPath("/saas-dashboards/aligna", bases)).toBe(true);
    expect(isCaseStudyPath("/saas-dashboards", bases)).toBe(false);
    expect(isCaseStudyPath("/saas-dashboards/aligna/more", bases)).toBe(false);
    expect(isCaseStudyPath("/work", bases)).toBe(false);
  });
});

describe("visitEndpoint", () => {
  it("sits next to the dashboard's message endpoint", () => {
    expect(visitEndpoint("https://dash.example.com/api/ingest")).toBe(
      "https://dash.example.com/api/ingest/events",
    );
  });
});

describe("cleanDetail", () => {
  it("keeps an error short and takes out anything personal", () => {
    expect(cleanDetail("Failed for sam@studio.co at /about?ref=abc with id 12345678")).toBe(
      "Failed for [email] at /about with id [number]",
    );
    expect(cleanDetail("a\n  b")).toBe("a b");
    expect(cleanDetail("x".repeat(300))).toHaveLength(200);
    expect(cleanDetail(42)).toBe("");
  });
});

describe("browserLabel", () => {
  it("names the browser and the system", () => {
    expect(
      browserLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari on iPhone");
    expect(
      browserLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
      ),
    ).toBe("Chrome on Windows");
    expect(browserLabel(null)).toBe("a browser");
  });
});
