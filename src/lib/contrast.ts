export type TokenMap = Readonly<Record<string, string>>;

/** Reads `--name: value;` declarations from CSS text. Names are returned without the leading dashes. */
export function parseTokens(css: string): TokenMap {
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`Not a 6-digit hex color: ${hex}`);
  const n = parseInt(match[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

/** WCAG 2.x contrast ratio between two 6-digit hex colors. */
export function contrastRatio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

export type ContrastPair = {
  foreground: string;
  background: string;
  /** Minimum ratio: 4.5 for body text, 3 for large text, control boundaries, and focus indicators. */
  min: number;
  use: string;
};

/** The Selected work scenes, by the names used in their colour tokens. */
export const sceneTones = ["toolswift", "smooth-erp", "aligna", "wajihni"] as const;
export type SceneTone = (typeof sceneTones)[number];

/** Every color pair that components use. Names are color token names without the `color-` prefix. */
export const contrastPairs: readonly ContrastPair[] = [
  { foreground: "foreground", background: "background", min: 4.5, use: "Body text on page" },
  { foreground: "foreground", background: "surface", min: 4.5, use: "Text on cards" },
  { foreground: "foreground", background: "surface-subtle", min: 4.5, use: "Text on tinted bands" },
  { foreground: "background", background: "foreground", min: 4.5, use: "Text on the menu overlay" },
  { foreground: "muted", background: "background", min: 4.5, use: "Secondary text on page" },
  { foreground: "muted", background: "surface", min: 4.5, use: "Secondary text on cards" },
  { foreground: "muted", background: "surface-subtle", min: 4.5, use: "Labels and footer text" },
  { foreground: "accent", background: "background", min: 4.5, use: "Links on page" },
  { foreground: "accent", background: "surface", min: 4.5, use: "Links on cards" },
  { foreground: "accent", background: "surface-subtle", min: 4.5, use: "Accent labels" },
  { foreground: "surface", background: "accent", min: 4.5, use: "Primary button text" },
  {
    foreground: "surface",
    background: "accent-strong",
    min: 4.5,
    use: "Primary button hover and pressed",
  },
  { foreground: "accent-strong", background: "background", min: 4.5, use: "Link hover on page" },
  {
    foreground: "accent-strong",
    background: "surface-subtle",
    min: 4.5,
    use: "Link hover on tinted bands",
  },
  { foreground: "border-strong", background: "background", min: 3, use: "Control outline on page" },
  { foreground: "border-strong", background: "surface", min: 3, use: "Control outline on cards" },
  {
    foreground: "border-strong",
    background: "surface-subtle",
    min: 3,
    use: "Control outline on tinted bands",
  },
  { foreground: "focus", background: "background", min: 3, use: "Focus ring on page" },
  { foreground: "focus", background: "surface", min: 3, use: "Focus ring on cards" },
  { foreground: "focus", background: "surface-subtle", min: 3, use: "Focus ring on tinted bands" },
  {
    foreground: "disabled",
    background: "background",
    min: 3,
    use: "Disabled text on page (exempt, still checked)",
  },
  {
    foreground: "disabled",
    background: "surface-subtle",
    min: 3,
    use: "Disabled button text (exempt, still checked)",
  },
  ...sceneContrastPairs(),
];

function sceneContrastPairs(): ContrastPair[] {
  return sceneTones.flatMap((tone) => {
    const background = `scene-${tone}-bg`;
    return [
      { foreground: `scene-${tone}-ink`, background, min: 4.5, use: `Title and text, ${tone}` },
      { foreground: `scene-${tone}-muted`, background, min: 4.5, use: `Summary and tabs, ${tone}` },
      { foreground: `scene-${tone}-accent`, background, min: 4.5, use: `Label and links, ${tone}` },
    ];
  });
}

export function pairRatio(tokens: TokenMap, pair: ContrastPair): number {
  const foreground = tokens[`color-${pair.foreground}`];
  const background = tokens[`color-${pair.background}`];
  if (!foreground || !background) {
    throw new Error(`Missing color token for ${pair.foreground} on ${pair.background}`);
  }
  return contrastRatio(foreground, background);
}
