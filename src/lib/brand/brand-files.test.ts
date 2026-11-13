import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTokens } from "@/lib/contrast";
import {
  iconSvg,
  lockupSvg,
  markSvg,
  monogramShapes,
  transformPath,
  type MonogramSize,
  type Point,
} from "./monogram";
import { wordmark } from "./wordmark";

const root = process.cwd();
const tokens = parseTokens(readFileSync(join(root, "src/styles/tokens.css"), "utf8"));
const colors = {
  ink: tokens["color-foreground"],
  paper: tokens["color-background"],
  lime: tokens["color-highlight"],
};

function edges(points: readonly Point[]) {
  return points.map((point, index) => [point, points[(index + 1) % points.length]] as const);
}

describe("ME monogram construction", () => {
  it.each(["master", "small"] as MonogramSize[])("%s: every diagonal rises 3 over 4", (size) => {
    const { upper, lower, middleBar } = monogramShapes(size);
    for (const shape of [upper, lower, middleBar]) {
      for (const [[x1, y1], [x2, y2]] of edges(shape)) {
        if (x1 === x2 || y1 === y2) continue;
        expect(Math.abs((y2 - y1) / (x2 - x1))).toBeCloseTo(0.75, 9);
      }
    }
  });

  it("small: straight edges land on whole pixels in the 16, 32 and 48 px favicon", () => {
    const { upper, lower } = monogramShapes("small");
    for (const pixels of [16, 32, 48]) {
      // The favicon tile is 160 units with the 120-unit mark at an offset of 20.
      const toPixel = (value: number) => ((value + 20) * pixels) / 160;
      for (const [[x1, y1], [x2, y2]] of [...edges(upper), ...edges(lower)]) {
        if (x1 === x2) expect(Number.isInteger(toPixel(x1)), `x=${x1} at ${pixels}px`).toBe(true);
        if (y1 === y2) expect(Number.isInteger(toPixel(y1)), `y=${y1} at ${pixels}px`).toBe(true);
      }
    }
  });

  it("keeps the middle bar inside the lower shape", () => {
    for (const size of ["master", "small"] as MonogramSize[]) {
      const { lower, middleBar, width, height } = monogramShapes(size);
      const ys = lower.map(([, y]) => y);
      for (const [x, y] of middleBar) {
        expect(x).toBeGreaterThanOrEqual(width / 2);
        expect(x).toBeLessThanOrEqual(width);
        expect(y).toBeGreaterThanOrEqual(Math.min(...ys));
        expect(y).toBeLessThanOrEqual(height);
      }
    }
  });

  it("moves and scales absolute path data", () => {
    expect(transformPath("M10 20H30V40L50 60Q1 2 3 4Z", 2, 1, -1)).toBe(
      "M21 39H61V79L101 119Q3 3 7 7Z",
    );
    expect(() => transformPath("m10 20", 1, 0, 0)).toThrow(/Relative/);
  });
});

describe("committed brand files", () => {
  const read = (path: string) => readFileSync(join(root, path), "utf8");

  it("match the construction and the colour tokens (run pnpm brand:build after a change)", () => {
    expect(read("public/brand/me-mark.svg")).toBe(markSvg(colors, "ink"));
    expect(read("public/brand/me-mark-on-dark.svg")).toBe(markSvg(colors, "paper"));
    expect(read("public/brand/me-mark-on-dark-lime.svg")).toBe(markSvg(colors, "paper-lime"));
    expect(read("public/brand/me-icon.svg")).toBe(iconSvg(colors, "app"));
    expect(read("public/brand/me-lockup.svg")).toBe(lockupSvg(colors, "ink", wordmark));
    expect(read("public/brand/me-lockup-on-dark.svg")).toBe(
      lockupSvg(colors, "paper-lime", wordmark),
    );
    expect(read("src/app/icon.svg")).toBe(iconSvg(colors, "favicon"));
  });

  it("are self-contained vectors: no raster images, scripts, filters or outside references", () => {
    for (const name of [
      "me-mark",
      "me-mark-on-dark",
      "me-mark-on-dark-lime",
      "me-icon",
      "me-lockup",
      "me-lockup-on-dark",
    ]) {
      const text = read(`public/brand/${name}.svg`);
      expect(text).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 [\d. ]+"/);
      expect(text).toContain("<title>Marwan Elsayed</title>");
      expect(text).not.toMatch(/<image|<script|<filter|<use|href=|<text|url\(/);
    }
  });

  it("uses lime only on ink: the light-background files are ink alone", () => {
    expect(read("public/brand/me-mark.svg")).not.toContain(colors.lime);
    expect(read("public/brand/me-lockup.svg")).not.toContain(colors.lime);
    expect(read("public/brand/me-mark-on-dark-lime.svg")).toContain(colors.lime);
  });

  it("ship a PNG-encoded favicon.ico with 16, 32 and 48 px images", () => {
    const ico = readFileSync(join(root, "src/app/favicon.ico"));
    expect([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([0, 1, 3]);
    const sizes = [0, 1, 2].map((index) => {
      const entry = 6 + 16 * index;
      const [width, height] = [ico.readUInt8(entry), ico.readUInt8(entry + 1)];
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      const png = ico.subarray(offset, offset + length);
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([width, height]);
      return width;
    });
    expect(sizes).toEqual([16, 32, 48]);
  });

  it("ship a 180 px apple-icon.png", () => {
    const png = readFileSync(join(root, "src/app/apple-icon.png"));
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([180, 180]);
  });
});
