import { describe, expect, it } from "vitest";
import { contactLogos, logoSvg, tileTone } from "./contact-logo-markup";

describe("contact logos", () => {
  it("throws the technologies the hero shows", () => {
    expect(contactLogos.length).toBeGreaterThanOrEqual(8);
    expect(contactLogos.map((logo) => logo.title)).toContain("React");
  });

  it("turns the data's @rrggbb fills into real colours and hides the svg from assistive technology", () => {
    for (const logo of contactLogos) {
      const svg = logoSvg(logo);
      expect(svg).not.toMatch(/@[0-9a-f]{6}/i);
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain(`viewBox="${logo.viewBox}"`);
    }
  });

  it("puts the near-white logos on a dark tile and the rest on a light one", () => {
    const dark = contactLogos.filter((logo) => tileTone(logo) === "dark").map((logo) => logo.title);
    expect(dark).toEqual(expect.arrayContaining(["Socket.IO", "Three.js"]));
    expect(tileTone(contactLogos.find((logo) => logo.title === "React")!)).toBe("light");
  });
});
