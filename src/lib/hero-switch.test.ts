import { describe, expect, it } from "vitest";
import { parseHeroSwitch } from "./hero-switch";

describe("parseHeroSwitch", () => {
  it("returns null when absent", () => {
    expect(parseHeroSwitch("")).toBeNull();
    expect(parseHeroSwitch("?other=1")).toBeNull();
  });

  it("parses every known value", () => {
    for (const value of ["fallback", "nowebgl", "slow", "fail", "hold", "lowperf"]) {
      expect(parseHeroSwitch(`?hero=${value}`)).toBe(value);
    }
  });

  it("ignores unknown values", () => {
    expect(parseHeroSwitch("?hero=scene")).toBeNull();
    expect(parseHeroSwitch("?hero=")).toBeNull();
    expect(parseHeroSwitch("?hero=FALLBACK")).toBeNull();
  });

  it("works together with other parameters", () => {
    expect(parseHeroSwitch("?a=1&hero=slow&b=2")).toBe("slow");
  });
});
