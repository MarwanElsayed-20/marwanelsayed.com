// Samples a colour world for every project from its own capture (public/projects/<slug>/card.png)
// and writes src/content/site/work-worlds.json. The Work index paints a project's world behind
// the page while its row is hovered. Run: pnpm worlds:build
import { createRequire } from "node:module";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const nextRequire = createRequire(realpathSync(join(root, "node_modules", "next", "package.json")));
const sharp = nextRequire("sharp");

// The site's own tokens (src/styles/tokens.css): worlds mix with these so they sit in the palette.
const PAPER = [0xec, 0xf1, 0xed];
const INK = [0x14, 0x14, 0x15];
const NIGHT = [0x10, 0x11, 0x12];

const slugs = [
  ...readFileSync(join(root, "src/content/projects/work-order.ts"), "utf8").matchAll(
    /^\s+"([a-z0-9-]+)",$/gm,
  ),
].map((match) => match[1]);

const mix = (a, b, t) => a.map((value, index) => Math.round(value + (b[index] - value) * t));
const hex = (rgb) => `#${rgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
const channel = (value) => {
  const unit = value / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hsv = ([r, g, b]) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r / 255) h = ((g - b) / 255 / d + 6) % 6;
    else if (max === g / 255) h = (b - r) / 255 / d + 2;
    else h = (r - g) / 255 / d + 4;
  }
  return { h: h * 60, s: max === 0 ? 0 : d / max, v: max };
};

/** Moves `color` toward black or white until it reads at `target` against `against`. */
function legible(color, against, target) {
  const toward = luminance(against) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  let result = color;
  for (let step = 1; step <= 20 && ratio(result, against) < target; step += 1)
    result = mix(color, toward, step / 20);
  return result;
}

const worlds = {};
for (const slug of slugs) {
  const { data, info } = await sharp(join(root, "public/projects", slug, "card.png"))
    .resize(96, 60, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let index = 0; index < info.width * info.height; index += 1)
    pixels.push([data[index * 3], data[index * 3 + 1], data[index * 3 + 2]]);
  const mean = pixels
    .reduce((sum, p) => sum.map((v, i) => v + p[i]), [0, 0, 0])
    .map((v) => v / pixels.length);
  // Judge by the page background (the most common tone of an interface), not by small dark text.
  const light = pixels.map(luminance).sort((a, b) => a - b)[Math.floor(pixels.length * 0.6)];
  const tone = light < 0.1 ? "dark" : "light";

  const bins = Array.from({ length: 24 }, () => ({ weight: 0, rgb: [0, 0, 0] }));
  for (const pixel of pixels) {
    const { h, s, v } = hsv(pixel);
    if (s < 0.32 || v < 0.28) continue;
    const bin = bins[Math.floor(h / 15) % 24];
    const weight = s * v;
    bin.weight += weight;
    bin.rgb = bin.rgb.map((value, i) => value + pixel[i] * weight);
  }
  const ranked = bins
    .map((bin, index) => ({
      index,
      weight:
        bin.weight + bins[(index + 1) % 24].weight * 0.5 + bins[(index + 23) % 24].weight * 0.5,
    }))
    .sort((a, b) => b.weight - a.weight);
  let raw;
  if (ranked[0].weight > 3) {
    const picks = [ranked[0].index, (ranked[0].index + 1) % 24, (ranked[0].index + 23) % 24];
    const total = picks.reduce((sum, i) => sum + bins[i].weight, 0);
    raw = [0, 1, 2].map((c) =>
      Math.round(picks.reduce((sum, i) => sum + bins[i].rgb[c], 0) / total),
    );
  } else {
    // A grey interface: take its own dark tone as the accent.
    raw = mix(mean.map(Math.round), tone === "dark" ? [255, 255, 255] : INK, 0.35);
  }

  const base = tone === "dark" ? NIGHT : PAPER;
  const field = tone === "dark" ? mix(NIGHT, raw, 0.14) : mix(PAPER, raw, 0.1);
  const wash = tone === "dark" ? mix(NIGHT, raw, 0.34) : mix(PAPER, raw, 0.26);
  const accent = legible(raw, field, 3);
  const deep = tone === "dark" ? mix(NIGHT, raw, 0.06) : mix(raw, INK, 0.55);
  worlds[slug] = {
    tone,
    field: hex(field),
    wash: hex(wash),
    accent: hex(accent),
    deep: hex(deep),
    glow: hex(raw),
  };
  void base;
}
writeFileSync(
  join(root, "src/content/site/work-worlds.json"),
  `${JSON.stringify(worlds, null, 2)}\n`,
);
console.log(
  Object.entries(worlds)
    .map(([slug, w]) => `${slug.padEnd(30)} ${w.tone.padEnd(5)} ${w.accent} ${w.field} ${w.wash}`)
    .join("\n"),
);
