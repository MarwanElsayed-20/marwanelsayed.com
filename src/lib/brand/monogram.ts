/**
 * The ME monogram. It is constructed, not drawn: every logo file, icon and share image is built
 * from the numbers below, so there is only one mark.
 *
 * Construction, in mark units with y pointing down. One stroke weight, one angle (a rise of 3
 * over a run of 4) for every diagonal:
 * - The upper shape is the M: a stem whose top is the apex of a chevron. The chevron's right arm
 *   rises to the top-right corner and is also the E's top bar.
 * - The lower shape is the rest of the E: a middle bar parallel to the arm and a flat foot,
 *   joined by a left edge that stands on the chevron's centre line.
 *
 * Two optical sizes share that construction. `master` is for 64 px and up. `small` is for
 * favicons: heavier diagonals, wider gaps and a flat foot, so its edges land on whole pixels at
 * 16, 32 and 48 px.
 *
 * Plain TypeScript with no imports, so `scripts/brand/run.mjs` can load it with Node directly.
 */
export type Point = readonly [number, number];

const constructions = {
  master: { width: 120, height: 112, stem: 20, band: 25, gap: 15, foot: 20, slantedFoot: true },
  small: { width: 120, height: 120, stem: 20, band: 30, gap: 20, foot: 20, slantedFoot: false },
} as const;

/** Rise over run of every diagonal. */
const SLOPE = 0.75;

export type MonogramSize = keyof typeof constructions;

/** The mark's shapes as polygons: the M, the lower part of the E, and the E's middle bar alone. */
export function monogramShapes(size: MonogramSize) {
  const { width: x, height: h, stem, band, gap, foot, slantedFoot } = constructions[size];
  const mid = x / 2;
  const valley = SLOPE * mid;
  // Top edge of the middle bar, which runs parallel to the arm one gap below it.
  const barTop = (at: number) => SLOPE * (x - at) + band + gap;
  // Where the middle bar's lower edge meets the top of the foot.
  const notch = x - (h - foot - 2 * band - gap) / SLOPE;
  const upper: Point[] = [
    [0, 0],
    [mid, valley],
    [x, 0],
    [x, band],
    [mid, valley + band],
    [stem, SLOPE * stem + band],
    [stem, slantedFoot ? h - SLOPE * stem : h],
    [0, h],
  ];
  const lower: Point[] = [
    [mid, barTop(mid)],
    [x, band + gap],
    [x, 2 * band + gap],
    [notch, h - foot],
    [x, h - foot],
    [x, h],
    [mid, h],
  ];
  const middleBar: Point[] = [
    [mid, barTop(mid)],
    [x, band + gap],
    [x, 2 * band + gap],
    [notch, h - foot],
    [mid, h - foot],
  ];
  return { width: x, height: h, upper, lower, middleBar };
}

const num = (value: number) => String(Math.round(value * 100) / 100);

/** A closed polygon as SVG path data, moved by an offset. */
export function polygonPath(points: readonly Point[], dx = 0, dy = 0) {
  return `M${points.map(([px, py]) => `${num(px + dx)} ${num(py + dy)}`).join("L")}Z`;
}

/** Path data for the whole mark (`mark`) and for the middle bar on its own (`accent`). */
export function monogramPaths(size: MonogramSize, dx = 0, dy = 0) {
  const { width, height, upper, lower, middleBar } = monogramShapes(size);
  return {
    width,
    height,
    mark: polygonPath(upper, dx, dy) + polygonPath(lower, dx, dy),
    accent: polygonPath(middleBar, dx, dy),
  };
}

/** The three site tokens the brand uses, read from src/styles/tokens.css by the caller. */
export type BrandColors = { ink: string; paper: string; lime: string };

/** Mark colour schemes. Lime is used only on ink: on the paper background it has no contrast. */
export type MarkScheme = "ink" | "paper" | "paper-lime";

const TITLE = "Marwan Elsayed";

function svg(width: number, height: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(width)} ${num(height)}" role="img" aria-label="${TITLE}"><title>${TITLE}</title>${body}</svg>\n`;
}

/** The mark's paths, filled. The accent bar is painted over the mark, so no seam shows. */
function markBody(colors: BrandColors, scheme: MarkScheme, size: MonogramSize, dx = 0, dy = 0) {
  const paths = monogramPaths(size, dx, dy);
  const fill = scheme === "ink" ? colors.ink : colors.paper;
  const base = `<path fill="${fill}" d="${paths.mark}"/>`;
  return scheme === "paper-lime"
    ? `${base}<path fill="${colors.lime}" d="${paths.accent}"/>`
    : base;
}

/** The mark alone on a transparent background, cropped to its own bounds. */
export function markSvg(colors: BrandColors, scheme: MarkScheme) {
  const { width, height } = monogramShapes("master");
  return svg(width, height, markBody(colors, scheme, "master"));
}

/**
 * Icon tiles: the paper mark with its lime bar on an ink square.
 * - `favicon`: small optical size filling 75% of a rounded tile, for browser tabs (16 to 48 px).
 * - `app`: master size at 60% of a full-bleed square, for home screens and avatars, which apply
 *   their own corner masks. The mark stays inside a circle crop.
 */
export function iconSvg(colors: BrandColors, kind: "favicon" | "app") {
  const size: MonogramSize = kind === "favicon" ? "small" : "master";
  const box = kind === "favicon" ? 160 : 200;
  const { width, height } = monogramShapes(size);
  const radius = kind === "favicon" ? ` rx="30"` : "";
  return svg(
    box,
    box,
    `<rect width="${box}" height="${box}"${radius} fill="${colors.ink}"/>` +
      markBody(colors, "paper-lime", size, (box - width) / 2, (box - height) / 2),
  );
}

/** Wordmark outlines in font units: y down, baseline at the cap height (see wordmark.ts). */
export type WordmarkOutline = {
  capHeight: number;
  xMin: number;
  xMax: number;
  d: string;
};

/** Scales and moves absolute path data (M, L, H, V, Q, C, Z commands only). */
export function transformPath(d: string, scale: number, dx: number, dy: number) {
  const tokens = d.match(/[MLHVQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  let command = "";
  let axis = 0;
  return tokens
    .map((token) => {
      if (/^[A-Z]$/i.test(token)) {
        command = token.toUpperCase();
        if (command !== token) throw new Error(`Relative path command "${token}" is not supported`);
        axis = 0;
        return token;
      }
      const value = Number(token) * scale;
      const isX = command === "H" || (command !== "V" && axis % 2 === 0);
      axis += 1;
      return num(value + (isX ? dx : dy));
    })
    .join(" ")
    .replace(/ ?([A-Z]) ?/g, "$1");
}

/** Lockup proportions, in mark heights: wordmark cap height and the space before it. */
export const LOCKUP = { capHeight: 0.5, gap: 0.42 } as const;

/**
 * The horizontal lockup: master mark, then the header's wordmark (Inter Tight bold, uppercase,
 * tracked -0.025em) outlined so the file needs no font. Cap height is half the mark height and
 * the wordmark is centred on the mark.
 */
export function lockupSvg(
  colors: BrandColors,
  scheme: "ink" | "paper-lime",
  word: WordmarkOutline,
) {
  const { width, height } = monogramShapes("master");
  const scale = (height * LOCKUP.capHeight) / word.capHeight;
  const left = width + height * LOCKUP.gap;
  const top = (height - height * LOCKUP.capHeight) / 2;
  const total = left + (word.xMax - word.xMin) * scale;
  const textFill = scheme === "ink" ? colors.ink : colors.paper;
  const text = transformPath(word.d, scale, left - word.xMin * scale, top);
  return svg(
    total,
    height,
    markBody(colors, scheme, "master") + `<path fill="${textFill}" d="${text}"/>`,
  );
}
