import localFont from "next/font/local";

/**
 * The one typeface: Inter Tight, a tight neo-grotesque. Variable weight 100 to 900, Latin subset.
 * Light and bold weights carry the hierarchy (a light line over a bold line), so no second family
 * is loaded. `--font-sans` and `--font-serif` both resolve to it.
 */
export const grotesk = localFont({
  src: [{ path: "../fonts/inter-tight-roman.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-grotesk",
  display: "swap",
  fallback: [
    "Inter Tight Metrics Fallback",
    "Inter Tight Linux Metrics Fallback",
    "system-ui",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: false,
});
