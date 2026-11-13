import { describe, expect, it } from "vitest";
import { collectExternalLinks } from "./external-links";

describe("collectExternalLinks", () => {
  it("returns nothing when there are no external links", () => {
    expect(
      collectExternalLinks({ profiles: [], digitalExperiences: [], digitalProducts: [] }),
    ).toEqual([]);
  });

  it("collects profile and live links once each, in order", () => {
    expect(
      collectExternalLinks({
        profiles: [
          { label: "One", url: "https://one.invalid/a" },
          { label: "Two", url: "https://two.invalid/b" },
        ],
        digitalExperiences: [
          { slug: "first", liveLink: { url: "https://live.invalid/x" } },
          { slug: "no-link" },
        ],
        digitalProducts: [
          { slug: "dup", liveLink: { url: "https://one.invalid/a" } },
          { slug: "second", liveLink: { url: "https://live.invalid/y" } },
        ],
      }),
    ).toEqual([
      { url: "https://one.invalid/a", source: "Contact: One" },
      { url: "https://two.invalid/b", source: "Contact: Two" },
      { url: "https://live.invalid/x", source: "Websites & E-commerce: first" },
      { url: "https://live.invalid/y", source: "SaaS & Dashboards: second" },
    ]);
  });
});
