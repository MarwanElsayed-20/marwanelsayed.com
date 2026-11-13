import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const srcDir = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = walk(srcDir).filter(
  (file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file),
);

const rel = (file: string) => relative(srcDir, file).split("\\").join("/");
const text = (file: string) => readFileSync(file, "utf8");

describe("sample content isolation", () => {
  it("lets only review routes import the sample data", () => {
    const importers = sources
      .filter((file) => /content\/projects\/(?:product-)?samples["']/.test(text(file)))
      .map(rel);
    expect(importers.length).toBeGreaterThan(0);
    expect(importers.every((file) => file.startsWith("app/design-system/"))).toBe(true);
  });

  it("keeps the production data and repository free of sample references", () => {
    for (const file of [
      "content/projects/digital-experiences.ts",
      "content/projects/digital-products.ts",
      "lib/projects/repository.ts",
    ]) {
      expect(text(join(srcDir, file)).toLowerCase(), file).not.toContain("samples");
    }
  });

  it("keeps production routes free of review and sample references", () => {
    const production = sources.filter((file) =>
      /^app\/(?:websites-ecommerce|saas-dashboards)\//.test(rel(file)),
    );
    expect(production.length).toBeGreaterThan(0);
    for (const file of production) {
      const content = text(file);
      expect(content, rel(file)).not.toContain("design-system");
      expect(content.toLowerCase(), rel(file)).not.toContain("sample");
    }
  });

  it("limits references to the sample image path to the review area and sample files", () => {
    const allowed = new Set(["lib/projects/sample.ts"]);
    const offenders = sources
      .filter((file) => text(file).includes("/design-system/sample-image/"))
      .map(rel)
      .filter((file) => !allowed.has(file) && !file.startsWith("app/design-system/"));
    expect(offenders).toEqual([]);
  });
});
