/**
 * Scroll arithmetic and scatter values for the home focus statement. The section pins while the
 * page scrolls through its track; progress 0..1 across that scroll drives every word in both
 * directions. Words start pushed toward the viewer inside a perspective (so they are large and
 * wide of their place), turned about a horizontal axis and invisible, and settle into the
 * paragraph; scrolling back up plays it in reverse.
 */

/** Scroll length of the track, in screen heights (the pinned screen included). */
export const TRACK = 3;

/** The perspective, in pixels, the words are scattered in. Must match the paragraph's CSS. */
export const PERSPECTIVE = 1000;

/** A fixed pseudo-random 0..1 for a word and a channel, so the scatter is the same every visit. */
export function noise(index: number, channel: number): number {
  const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/** Scroll progress through the pinned track: 0 when the screen pins, 1 when it lets go. */
export function trackProgress(trackTop: number, trackHeight: number, viewport: number): number {
  const length = trackHeight - viewport;
  if (length <= 0) return 1;
  return Math.min(1, Math.max(0, -trackTop / length));
}

export type Scatter = {
  /** Toward the viewer, in pixels: how big and how far from its place the word starts. */
  z: number;
  /** Sideways, as a percent of the word's own width. */
  xPercent: number;
  /** Up or down, as a percent of the word's own height. */
  yPercent: number;
  /** Turn about the horizontal axis, in degrees. */
  rotationX: number;
};

/** Where a word starts before it settles into the paragraph. */
export function scatterOf(index: number): Scatter {
  return {
    z: 500 + noise(index, 1) * 450,
    xPercent: (noise(index, 2) * 2 - 1) * 100,
    yPercent: (noise(index, 3) * 2 - 1) * 10,
    rotationX: (noise(index, 4) * 2 - 1) * 90,
  };
}
