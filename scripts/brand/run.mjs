// Builds every brand file from the one construction in src/lib/brand/monogram.ts and the colour
// tokens in src/styles/tokens.css. Vectors are written as text; the raster icons are rendered in
// headless Chromium at their real sizes (not scaled down from a large image).
//
// Usage: pnpm brand:build
// Outputs: public/brand/*.svg, src/app/icon.svg, src/app/favicon.ico (16, 32, 48),
// src/app/apple-icon.png (180). src/lib/brand/brand-files.test.ts fails if they drift.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { iconSvg, lockupSvg, markSvg } from "../../src/lib/brand/monogram.ts";
import { wordmark } from "../../src/lib/brand/wordmark.ts";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const tokens = await readFile(join(repo, "src/styles/tokens.css"), "utf8");
const token = (name) => {
  const value = tokens.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing colour token: ${name}`);
  return value.toLowerCase();
};
const colors = { ink: token("foreground"), paper: token("background"), lime: token("highlight") };

const vectors = {
  "public/brand/me-mark.svg": markSvg(colors, "ink"),
  "public/brand/me-mark-on-dark.svg": markSvg(colors, "paper"),
  "public/brand/me-mark-on-dark-lime.svg": markSvg(colors, "paper-lime"),
  "public/brand/me-icon.svg": iconSvg(colors, "app"),
  "public/brand/me-lockup.svg": lockupSvg(colors, "ink", wordmark),
  "public/brand/me-lockup-on-dark.svg": lockupSvg(colors, "paper-lime", wordmark),
  "src/app/icon.svg": iconSvg(colors, "favicon"),
};
await mkdir(join(repo, "public/brand"), { recursive: true });
for (const [path, text] of Object.entries(vectors)) await writeFile(join(repo, path), text);

/** An ICO whose images are PNG-encoded (supported by every current browser and Windows). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const render = async (markup, size) => {
    await page.setViewportSize({ width: size, height: size });
    const sized = markup.replace("<svg ", `<svg width="${size}" height="${size}" `);
    await page.setContent(`<!doctype html><body style="margin:0">${sized}</body>`);
    return page.locator("svg").screenshot({ omitBackground: true });
  };
  const favicon = [];
  for (const size of [16, 32, 48])
    favicon.push({ size, png: await render(vectors["src/app/icon.svg"], size) });
  await writeFile(join(repo, "src/app/favicon.ico"), ico(favicon));
  await writeFile(join(repo, "src/app/apple-icon.png"), await render(iconSvg(colors, "app"), 180));
} finally {
  await browser.close();
}
process.stdout.write(
  `Wrote ${Object.keys(vectors).length} SVG files, favicon.ico and apple-icon.png\n`,
);
