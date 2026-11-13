import { describe, expect, it } from "vitest";
import { chooseCurrentSection } from "./current-section";

describe("chooseCurrentSection", () => {
  it("returns null before the first section or without home sections", () => {
    expect(chooseCurrentSection([])).toBeNull();
    expect(chooseCurrentSection([{ id: "about", top: 10 }])).toBeNull();
  });
  it("chooses the nearest section above the viewport regardless of input order", () => {
    expect(
      chooseCurrentSection([
        { id: "about", top: -10 },
        { id: "contact", top: 500 },
        { id: "work", top: -1000 },
      ]),
    ).toBe("about");
    expect(chooseCurrentSection([{ id: "contact", top: 0 }])).toBe("contact");
  });
});
