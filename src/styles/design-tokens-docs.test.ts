import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastPairs, pairRatio, parseTokens } from "@/lib/contrast";

const root = process.cwd();
const tokens = parseTokens(readFileSync(join(root, "src", "styles", "tokens.css"), "utf8"));
const docs = readFileSync(join(root, "docs", "design-tokens.md"), "utf8")
  .split(/\r?\n/)
  .map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .join(" | "),
  )
  .join("\n");

describe("docs/design-tokens.md", () => {
  it.each(contrastPairs)("lists $foreground on $background with its exact ratio", (pair) => {
    const ratio = pairRatio(tokens, pair).toFixed(2);
    const row = `| ${pair.foreground} | ${pair.background} | ${ratio} | ${pair.min} |`;
    expect(docs, row).toContain(row);
  });
});
