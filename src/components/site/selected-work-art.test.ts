import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import art from "./selected-work-art.json";

/** Width and height from a WebP file's header (lossy, lossless or extended). */
function webpSize(file: string): { width: number; height: number } {
  const data = readFileSync(file);
  expect(data.toString("ascii", 0, 4)).toBe("RIFF");
  expect(data.toString("ascii", 8, 12)).toBe("WEBP");
  const chunk = data.toString("ascii", 12, 16);
  if (chunk === "VP8X")
    return { width: data.readUIntLE(24, 3) + 1, height: data.readUIntLE(27, 3) + 1 };
  if (chunk === "VP8L") {
    const bits = data.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
}

const file = (name: string) => join(process.cwd(), "public", "selected-work", `${name}.webp`);

describe("Selected work artwork", () => {
  it("has every rendered file at the size its manifest records", () => {
    for (const [name, entry] of Object.entries(art))
      expect(webpSize(file(name)), name).toEqual({ width: entry.width, height: entry.height });
  });

  it("puts every rendered object to use in a scene's artwork", () => {
    const folder = join(process.cwd(), "src", "components", "site", "scene-art");
    const sources = readdirSync(folder)
      .map((name) => readFileSync(join(folder, name), "utf8"))
      .join("\n");
    for (const name of Object.keys(art)) expect(sources, name).toContain(`"${name}"`);
  });
});
