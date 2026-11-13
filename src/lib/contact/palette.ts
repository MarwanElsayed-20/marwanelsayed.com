import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseTokens } from "@/lib/contrast";

export type EmailPalette = {
  background: string;
  surface: string;
  subtle: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
};

/** Maps design tokens to email colors. Pure, so it can be tested with any token map. */
export function paletteFromTokens(tokens: Readonly<Record<string, string>>): EmailPalette {
  const pick = (name: string) => {
    const value = tokens[`color-${name}`];
    if (!value) throw new Error(`Missing design token for the email palette: ${name}`);
    return value;
  };
  return {
    background: pick("background"),
    surface: pick("surface"),
    subtle: pick("surface-subtle"),
    foreground: pick("foreground"),
    muted: pick("muted"),
    accent: pick("accent"),
    border: pick("border"),
  };
}

/**
 * Email clients cannot read CSS variables, so the palette is resolved from the same token file the
 * site uses. next.config.ts traces that file into the contact route's deployment.
 */
export function loadEmailPalette(): EmailPalette {
  const css = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
  return paletteFromTokens(parseTokens(css));
}
