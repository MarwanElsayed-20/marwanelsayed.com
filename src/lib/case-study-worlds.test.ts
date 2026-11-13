import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, parseTokens } from "./contrast";
import { worldOf } from "./work-world";
import worlds from "../content/site/work-worlds.json";

const root = join(__dirname, "..");
const css = readFileSync(join(root, "app", "globals.css"), "utf8");
const tokens = parseTokens(readFileSync(join(root, "styles", "tokens.css"), "utf8"));

/** The share of a colour the case study mixes into another, read from the stylesheet itself. */
function share(pattern: RegExp): number {
  const match = pattern.exec(css);
  if (!match) throw new Error(`Not found in globals.css: ${pattern}`);
  return Number(match[1]) / 100;
}

const inkAccentShare = share(
  /--case-ink-accent:\s*color-mix\(in srgb, var\(--world-accent\) (\d+)%/,
);
const panelShare = share(/--case-panel:\s*color-mix\(in srgb, var\(--world-wash\) (\d+)%/);
const darkPanelShare = share(
  /data-world-tone="dark"\]\s*\{\s*--case-panel:\s*color-mix\(in srgb, var\(--world-wash\) (\d+)%/,
);
const captionShare = share(
  /\.case-hero-media figcaption \{[^}]*background:\s*color-mix\(in srgb, var\(--world-accent\) (\d+)%/,
);
const deepShare = share(/--case-dark:\s*color-mix\(in srgb, var\(--world-deep\) (\d+)%/);

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) =>
  `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
/** `color-mix(in srgb, a share%, b)`. */
const mix = (a: string, share: number, b: string) =>
  toHex(channels(a).map((value, i) => value * share + channels(b)[i] * (1 - share)));

const paper = tokens["color-background"];
const ink = tokens["color-foreground"];
const muted = tokens["color-muted"];

describe("case study colour worlds", () => {
  const slugs = Object.keys(worlds);

  it.each(slugs)("%s: small text reads on its panel, caption and the dark chapter", (slug) => {
    const world = worldOf(slug);
    const panel = mix(world.wash, world.tone === "dark" ? darkPanelShare : panelShare, paper);
    const caption = mix(world.accent, captionShare, paper);
    const accentInk = mix(world.accent, inkAccentShare, ink);
    const dark = mix(world.deep, deepShare, ink);
    // Labels, numbers and fact names in the accent as ink, on the paper, the panel and the caption.
    expect(contrastRatio(accentInk, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accentInk, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accentInk, caption)).toBeGreaterThanOrEqual(4.5);
    // Secondary text on the panel (alternate chapters, the hero on a phone) and on the caption.
    expect(contrastRatio(muted, panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted, caption)).toBeGreaterThanOrEqual(4.5);
    // The dark chapter: paper text, the border grey as secondary text, lime as its marker.
    expect(contrastRatio(paper, dark)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["color-border"], dark)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["color-highlight"], dark)).toBeGreaterThanOrEqual(4.5);
  });
});
