import { describe, expect, it } from "vitest";
import { damp, driftAngles, normalizePointer } from "./parallax";

describe("normalizePointer", () => {
  it("maps the center to zero", () => {
    expect(normalizePointer(500, 400, 1000, 800)).toEqual({ x: 0, y: -0 });
  });

  it("maps the corners to the extremes with y up positive", () => {
    expect(normalizePointer(0, 0, 1000, 800)).toEqual({ x: -1, y: 1 });
    expect(normalizePointer(1000, 800, 1000, 800)).toEqual({ x: 1, y: -1 });
  });

  it("clamps positions outside the box", () => {
    expect(normalizePointer(5000, -5000, 1000, 800)).toEqual({ x: 1, y: 1 });
  });

  it("returns zero for an empty box", () => {
    expect(normalizePointer(10, 10, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("damp", () => {
  it("does not move with zero elapsed time", () => {
    expect(damp(0, 1, 5, 0)).toBe(0);
  });

  it("moves toward the target without overshooting", () => {
    const next = damp(0, 1, 5, 0.1);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it("converges after a long time", () => {
    expect(damp(0, 1, 5, 10)).toBeCloseTo(1, 5);
  });
});

describe("driftAngles", () => {
  it("starts at zero and keeps turning slowly", () => {
    expect(driftAngles(0)).toEqual({ x: 0, y: 0 });
    expect(driftAngles(10).y).toBeGreaterThan(driftAngles(1).y);
  });

  it("keeps the tilt small", () => {
    for (let t = 0; t < 60; t += 1) expect(Math.abs(driftAngles(t).x)).toBeLessThanOrEqual(0.08);
  });
});
