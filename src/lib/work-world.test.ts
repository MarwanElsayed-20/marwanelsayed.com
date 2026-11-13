import { describe, expect, it } from "vitest";
import { workOrder } from "@/content/projects/work-order";
import rawWorlds from "@/content/site/work-worlds.json";
import {
  commitDelay,
  hoverTiming,
  isRapid,
  pointerOf,
  sceneVars,
  shellVars,
  worldOf,
  type WorldPalette,
} from "./work-world";

const worlds = rawWorlds as Record<string, WorldPalette>;

const channel = (value: number) => {
  const unit = value / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("work worlds", () => {
  it("has a sampled world for every project in the Work order, and no others", () => {
    expect(Object.keys(worlds).sort()).toEqual([...workOrder].sort());
  });

  it("keeps each world's accent legible against its own field (titles are large text)", () => {
    for (const [slug, world] of Object.entries(worlds)) {
      for (const key of ["field", "wash", "accent", "deep", "glow"] as const)
        expect(world[key], `${slug} ${key}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(ratio(world.accent, world.field), slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("is light or dark, and a dark world is dark enough to carry paper-coloured text", () => {
    for (const [slug, world] of Object.entries(worlds)) {
      expect(["light", "dark"], slug).toContain(world.tone);
      if (world.tone === "dark") expect(luminance(world.field), slug).toBeLessThan(0.05);
      else expect(luminance(world.field), slug).toBeGreaterThan(0.6);
    }
  });

  it("falls back to the site's tones for an unknown project", () => {
    expect(worldOf("nothing-here").field).toBe("var(--color-surface-subtle)");
    expect(sceneVars(worldOf("nothing-here"))["--world-field"]).toBe("var(--color-surface-subtle)");
  });
});

describe("shellVars", () => {
  it("turns the page's ink to paper over a dark world and back over a light one", () => {
    const dark = Object.values(worlds).find((world) => world.tone === "dark")!;
    const light = Object.values(worlds).find((world) => world.tone === "light")!;
    expect(shellVars(dark)["--world-ui"]).toBe("var(--color-background)");
    expect(shellVars(dark)["--world-surface"]).toBe(dark.field);
    expect(shellVars(light)["--world-ui"]).toBe("var(--color-foreground)");
    expect(shellVars(light)["--world-surface"]).toBe("var(--color-background)");
    expect(shellVars(undefined)["--world-ui"]).toBe("var(--color-foreground)");
  });
});

describe("hover timing", () => {
  it("treats a row entered within 170ms of the last as a rapid move, for the pointer only", () => {
    expect(isRapid("pointer", 1000, 1100)).toBe(true);
    expect(isRapid("pointer", 1000, 1170)).toBe(false);
    expect(isRapid("pointer", 0, 50)).toBe(false);
    expect(isRapid("keyboard", 1000, 1050)).toBe(false);
  });

  it("commits at once for the keyboard and after a short wait for the pointer", () => {
    expect(commitDelay("keyboard", false)).toBe(0);
    expect(commitDelay("pointer", false)).toBe(hoverTiming.commit.pointer);
    expect(commitDelay("pointer", true)).toBe(hoverTiming.commit.rapid);
  });
});

describe("pointerOf", () => {
  it("maps the viewport to -1…1", () => {
    expect(pointerOf(0, 0, 1000, 800)).toEqual({ x: -1, y: -1 });
    expect(pointerOf(500, 400, 1000, 800)).toEqual({ x: 0, y: 0 });
    expect(pointerOf(1000, 800, 1000, 800)).toEqual({ x: 1, y: 1 });
  });
});
