import { describe, expect, it } from "vitest";
import { PERSPECTIVE, noise, scatterOf, trackProgress } from "./focus-statement";

describe("trackProgress", () => {
  it("runs from 0 as the screen pins to 1 as it lets go", () => {
    expect(trackProgress(0, 2400, 800)).toBe(0);
    expect(trackProgress(-800, 2400, 800)).toBe(0.5);
    expect(trackProgress(-1600, 2400, 800)).toBe(1);
    expect(trackProgress(500, 2400, 800)).toBe(0);
    expect(trackProgress(-9000, 2400, 800)).toBe(1);
  });
});

describe("scatterOf", () => {
  it("keeps every word in front of the viewer's eye, inside the perspective", () => {
    for (let index = 0; index < 120; index += 1) {
      const { z, xPercent, yPercent, rotationX } = scatterOf(index);
      expect(z).toBeGreaterThanOrEqual(500);
      expect(z).toBeLessThan(PERSPECTIVE);
      expect(Math.abs(xPercent)).toBeLessThanOrEqual(100);
      expect(Math.abs(yPercent)).toBeLessThanOrEqual(10);
      expect(Math.abs(rotationX)).toBeLessThanOrEqual(90);
    }
  });

  it("is the same on every visit", () => {
    expect(scatterOf(7)).toEqual(scatterOf(7));
    expect(noise(7, 1)).toBe(noise(7, 1));
  });

  it("varies from word to word", () => {
    const starts = new Set(Array.from({ length: 40 }, (_, index) => scatterOf(index).z.toFixed(0)));
    expect(starts.size).toBeGreaterThan(30);
  });
});
