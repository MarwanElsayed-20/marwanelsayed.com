import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastPairs, pairRatio, parseTokens } from "@/lib/contrast";

const srcDir = join(process.cwd(), "src");
const illustrationFactsDir = join(srcDir, "content", "illustrations");
const tokensPath = join(srcDir, "styles", "tokens.css");
const tokens = parseTokens(readFileSync(tokensPath, "utf8"));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("design tokens", () => {
  it("defines every required color token as a 6-digit hex value", () => {
    const names = [
      "background",
      "surface",
      "surface-subtle",
      "foreground",
      "muted",
      "accent",
      "accent-strong",
      "border",
      "border-strong",
      "focus",
      "disabled",
    ];
    for (const name of names) {
      expect(tokens[`color-${name}`], `color-${name}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("defines the type, spacing, width, radius, and motion tokens", () => {
    const names = [
      "font-sans",
      "font-serif",
      "text-display",
      "text-h1",
      "text-h2",
      "text-h3",
      "text-h4",
      "text-lead",
      "text-body",
      "text-small",
      "text-label",
      "spacing-section",
      "spacing-gutter",
      "spacing-stack",
      "container-reading",
      "container-page",
      "container-wide",
      "radius-sm",
      "radius-md",
      "radius-lg",
      "duration-fast",
      "duration-base",
      "ease-standard",
    ];
    for (const name of names) {
      expect(tokens[name], name).toBeTruthy();
    }
  });

  it("keeps color literals out of the source outside tokens.css", () => {
    const patterns = [/#[0-9a-fA-F]{3,8}\b/, /\brgba?\(/i, /\bhsla?\(/i, /\boklch\(/i, /\[#/];
    const offenders: string[] = [];
    for (const file of walk(srcDir)) {
      if (!/\.(ts|tsx|css)$/.test(file)) continue;
      if (file === tokensPath || /\.test\.(ts|tsx)$/.test(file)) continue;
      // Owner-approved build-time source palettes are not site UI design tokens.
      if (
        file.startsWith(illustrationFactsDir + "/") ||
        file.startsWith(illustrationFactsDir + "\\")
      )
        continue;
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (patterns.some((pattern) => pattern.test(line))) {
          offenders.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it.each(contrastPairs)("$foreground on $background meets its minimum contrast", (pair) => {
    expect(pairRatio(tokens, pair)).toBeGreaterThanOrEqual(pair.min);
  });
});
