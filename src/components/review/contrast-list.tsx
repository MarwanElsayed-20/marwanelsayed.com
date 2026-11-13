import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrastPairs, pairRatio, parseTokens, type TokenMap } from "@/lib/contrast";

function loadTokens(): TokenMap {
  try {
    return parseTokens(readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8"));
  } catch {
    return {};
  }
}

/** Live contrast ratios computed from the real token values (server-side). */
export function ContrastList() {
  const tokens = loadTokens();
  return (
    <ul className="flex flex-col gap-2 text-small text-foreground">
      {contrastPairs.map((pair) => {
        let ratio: number | null = null;
        try {
          ratio = pairRatio(tokens, pair);
        } catch {
          ratio = null;
        }
        const passes = ratio !== null && ratio >= pair.min;
        return (
          <li
            key={`${pair.foreground}-${pair.background}`}
            data-contrast-row
            data-ratio={ratio === null ? "" : ratio.toFixed(2)}
            data-min={pair.min}
          >
            <span className="font-medium">
              {pair.foreground} on {pair.background}
            </span>
            {": "}
            {ratio === null ? "unavailable" : `${ratio.toFixed(2)}:1`}
            {` (minimum ${pair.min}:1, ${passes ? "pass" : "fail"}). ${pair.use}.`}
          </li>
        );
      })}
    </ul>
  );
}
