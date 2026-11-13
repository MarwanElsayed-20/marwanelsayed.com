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

function rel(file: string) {
  return relative(srcDir, file).split("\\").join("/");
}

describe("one 3D scene", () => {
  it("lets only hero-scene.tsx import three or @react-three/fiber", () => {
    const offenders = sources
      .filter((file) =>
        /from\s+["'](three|@react-three\/fiber)(\/[^"']*)?["']/.test(readFileSync(file, "utf8")),
      )
      .map(rel);
    expect(offenders).toEqual(["components/hero/hero-scene.tsx"]);
  });

  it("lets only hero-stage.tsx import hero-scene", () => {
    const offenders = sources
      .filter((file) => /hero-scene["']/.test(readFileSync(file, "utf8")))
      .map(rel);
    expect(offenders).toEqual(["components/hero/hero-stage.tsx"]);
  });

  it("imports hero-scene only dynamically (plus a type-only import) in hero-stage.tsx", () => {
    const text = readFileSync(join(srcDir, "components", "hero", "hero-stage.tsx"), "utf8");
    expect(text).toMatch(/import\("@\/components\/hero\/hero-scene"\)/);
    expect(text).toMatch(/import type \{ HeroSceneProps \} from "@\/components\/hero\/hero-scene"/);
    expect(text).not.toMatch(/^import \{[^}]*\} from "@\/components\/hero\/hero-scene"/m);
  });
});
