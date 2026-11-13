import worlds from "@/content/site/work-worlds.json";

export type WorldTone = "light" | "dark";

/** A project's colour world, sampled from its own capture (scripts/work-worlds). */
export type WorldPalette = {
  tone: WorldTone;
  /** The wide background of the world. */
  field: string;
  /** The second colour its background drifts to. */
  wash: string;
  /** Titles, rules and the register line: legible against the field. */
  accent: string;
  /** Shadows and the quiet lines of the pattern. */
  deep: string;
  /** The brightest colour of the capture: glows and the source marker. */
  glow: string;
};

const palettes = worlds as Readonly<Record<string, WorldPalette>>;

/** What a project without a sampled world gets: the site's own surface tones. */
const fallback: WorldPalette = {
  tone: "light",
  field: "var(--color-surface-subtle)",
  wash: "var(--color-border)",
  accent: "var(--color-accent)",
  deep: "var(--color-foreground)",
  glow: "var(--color-accent-strong)",
};

export function worldOf(slug: string): WorldPalette {
  return palettes[slug] ?? fallback;
}

type Vars = Record<`--${string}`, string>;

/** The colours a scene paints with (the whole world is these and the capture). */
export function sceneVars(world: WorldPalette): Vars {
  return {
    "--world-field": world.field,
    "--world-wash": world.wash,
    "--world-accent": world.accent,
    "--world-deep": world.deep,
    "--world-glow": world.glow,
  };
}

/**
 * What the page's own rows turn into while a world is behind them: ink on a light world, paper on
 * a dark one, and the world's accent for the active row.
 */
export function shellVars(world: WorldPalette | undefined): Vars {
  const dark = world?.tone === "dark";
  return {
    "--world-ui": dark ? "var(--color-background)" : "var(--color-foreground)",
    "--world-muted": dark ? "var(--color-border)" : "var(--color-muted)",
    "--world-surface": dark
      ? (world?.field ?? "var(--color-foreground)")
      : "var(--color-background)",
    "--world-accent": world?.accent ?? "var(--color-foreground)",
  };
}

export type HoverKind = "pointer" | "keyboard";

/**
 * How long a row must stay under the pointer before its world takes over: just long
 * enough that a pointer passing through does not flash worlds, quicker
 * once the pointer is moving between rows, immediate for the keyboard.
 */
export const hoverTiming = {
  /** Wait before the world commits. */
  commit: { pointer: 100, rapid: 135, keyboard: 0 },
  /** A row entered this soon after the last one counts as a rapid move. */
  rapidGap: 170,
  /** Wait before the project's captures are fetched ahead of the world. */
  prewarm: { pointer: 250, keyboard: 200 },
  /** After the pointer leaves: the world starts to leave, then is removed. */
  hide: 90,
  reset: 620,
  /** The outgoing world stays this long beneath the incoming one. */
  previous: { normal: 520, rapid: 280 },
  /** After this long a world is still: its animations pause. */
  settle: 1450,
} as const;

export function isRapid(kind: HoverKind, lastStamp: number, stamp: number): boolean {
  return kind === "pointer" && lastStamp > 0 && stamp - lastStamp < hoverTiming.rapidGap;
}

export function commitDelay(kind: HoverKind, rapid: boolean): number {
  return kind === "keyboard"
    ? hoverTiming.commit.keyboard
    : rapid
      ? hoverTiming.commit.rapid
      : hoverTiming.commit.pointer;
}

/** The pointer as -1…1 across the viewport: what the world's layers drift with. */
export function pointerOf(x: number, y: number, width: number, height: number) {
  return { x: (x / width) * 2 - 1, y: (y / height) * 2 - 1 };
}
