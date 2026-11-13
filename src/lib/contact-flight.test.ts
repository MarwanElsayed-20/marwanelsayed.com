import { describe, expect, it } from "vitest";
import {
  APEX_RANGE,
  apexOf,
  gravityFor,
  isGone,
  launch,
  poke,
  SPIN_RANGE,
  step,
} from "./contact-flight";

const fixed = (value: number) => () => value;

describe("launch", () => {
  it("starts just below the band, inside its width", () => {
    const flight = launch(1000, 800, 80, fixed(0.5));
    expect(flight.y).toBe(840);
    expect(flight.x).toBeGreaterThanOrEqual(40);
    expect(flight.x).toBeLessThanOrEqual(960);
    expect(flight.vy).toBeLessThan(0);
  });

  it("climbs to a height inside the apex range", () => {
    for (const value of [0, 0.5, 1]) {
      const flight = launch(1000, 800, 80, fixed(value));
      const climb = apexOf(flight.vy, 800) / 800;
      expect(climb).toBeGreaterThanOrEqual(APEX_RANGE[0] - 1e-9);
      expect(climb).toBeLessThanOrEqual(APEX_RANGE[1] + 1e-9);
    }
  });

  it("spins within its range and never starts turned", () => {
    const flight = launch(1000, 800, 80, fixed(0.5));
    expect(flight.angle).toBe(0);
    expect(flight.spin).toBeGreaterThanOrEqual(SPIN_RANGE[0]);
    expect(flight.spin).toBeLessThanOrEqual(SPIN_RANGE[1]);
  });

  it("copes with a band narrower than a logo", () => {
    const flight = launch(30, 800, 80, fixed(0.9));
    expect(flight.x).toBe(15);
  });
});

describe("step and isGone", () => {
  it("rises, turns at its apex, falls and is gone once below the band", () => {
    const height = 800;
    const flight = launch(1000, height, 80, fixed(0.5));
    let top = flight.y;
    let peaked = false;
    for (let t = 0; t < 20 && !isGone(flight, height); t += 1 / 60) {
      step(flight, 1 / 60, height);
      top = Math.min(top, flight.y);
      if (flight.vy > 0) peaked = true;
    }
    expect(peaked).toBe(true);
    expect(isGone(flight, height)).toBe(true);
    // It climbed about as high as launched (fixed(0.5) is the middle of the range).
    const expected = ((APEX_RANGE[0] + APEX_RANGE[1]) / 2) * height;
    expect(height + 40 - top).toBeGreaterThan(expected * 0.95);
    expect(height + 40 - top).toBeLessThan(expected * 1.05);
  });

  it("is not gone while still climbing from below the edge", () => {
    const flight = launch(1000, 800, 80, fixed(0.5));
    expect(isGone(flight, 800)).toBe(false);
  });

  it("falls faster in a taller band, and the same share of it per second", () => {
    expect(gravityFor(1600)).toBe(2 * gravityFor(800));
  });
});

describe("poke", () => {
  it("adds an upward push and spin", () => {
    const flight = launch(1000, 800, 80, fixed(0.5));
    step(flight, 1, 800);
    const before = { vy: flight.vy, spin: flight.spin };
    poke(flight, 800);
    expect(flight.vy).toBeLessThan(before.vy);
    expect(flight.spin).toBeGreaterThan(before.spin);
  });
});
