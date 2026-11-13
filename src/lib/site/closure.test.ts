import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const roots = [
  join(process.cwd(), "src", "lib", "site"),
  join(process.cwd(), "src", "content", "site"),
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = roots
  .flatMap(walk)
  .filter((file) => /\.ts$/.test(file) && !/\.test\.ts$/.test(file));

const specifiers = (text: string): string[] =>
  [...text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((match) => match[1]);

describe("closure rule", () => {
  it("finds source files in both folders", () => {
    expect(sources.some((file) => file.includes(join("src", "lib", "site")))).toBe(true);
    expect(sources.some((file) => file.includes(join("src", "content", "site")))).toBe(true);
  });

  it("imports only relative paths or node: modules (no @/ alias)", () => {
    for (const file of sources) {
      for (const specifier of specifiers(readFileSync(file, "utf8"))) {
        const ok =
          specifier.startsWith("./") ||
          specifier.startsWith("../") ||
          specifier.startsWith("node:");
        expect(ok, `${relative(process.cwd(), file)} imports "${specifier}"`).toBe(true);
      }
    }
  });
});
