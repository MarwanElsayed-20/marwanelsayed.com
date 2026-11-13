import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { isValidEmail, validateSiteContent } from "../../lib/site/content-rules";
import { sampleAbout, sampleContact } from "./review-samples";

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

describe("review samples", () => {
  it("are imported only by review routes", () => {
    const importers = sources
      .filter((file) => /content\/site\/review-samples["']/.test(readFileSync(file, "utf8")))
      .map(rel);
    expect(importers.length).toBeGreaterThan(0);
    expect(importers.every((file) => file.startsWith("app/design-system/"))).toBe(true);
  });

  it("are valid content and clearly synthetic", () => {
    expect(
      validateSiteContent({
        siteName: null,
        home: { headline: "Sample headline", introduction: null },
        about: sampleAbout,
        contact: sampleContact,
      }),
    ).toEqual([]);
    expect(isValidEmail(sampleContact.email)).toBe(true);
    expect(sampleContact.email.endsWith(".invalid")).toBe(true);
    for (const profile of sampleContact.profiles) {
      expect(new URL(profile.url).hostname.endsWith(".invalid")).toBe(true);
    }
    for (const paragraph of [
      ...sampleAbout.introduction,
      ...sampleAbout.approach,
      ...sampleAbout.background,
    ]) {
      expect(paragraph.toLowerCase()).toContain("sample");
    }
  });

  it("keeps the production About, Contact and site components free of sample and review references", () => {
    const production = sources.filter((file) =>
      /^(?:app\/about\/|app\/contact\/|components\/site\/)/.test(rel(file)),
    );
    expect(production.length).toBeGreaterThan(0);
    for (const file of production) {
      const content = readFileSync(file, "utf8").toLowerCase();
      expect(content, rel(file)).not.toContain("sample");
      expect(content, rel(file)).not.toContain("design-system");
    }
  });

  it("are not referenced by the production content or content wiring", () => {
    for (const file of ["lib/site-content.ts", "config/site.ts", "lib/site-pages.ts"]) {
      expect(readFileSync(join(srcDir, file), "utf8").toLowerCase(), file).not.toContain(
        "review-samples",
      );
    }
  });
});
