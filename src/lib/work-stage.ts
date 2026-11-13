/**
 * Scroll arithmetic for the pinned Selected work panel. The panel sticks to the screen while
 * the page scrolls through its track; each scene owns one step of that scroll, centred on its
 * own offset, so scene i shows from half a step before i * step to half a step after. The first
 * scene shows from the moment the panel pins, and the last holds for half a step before the
 * panel lets go.
 */

/** Scroll length (in screen heights) given to each scene. */
export const STEP = 0.85;

/** Scroll the track adds beyond the panel's own screen, in steps. */
export function trackSteps(count: number): number {
  return count - 0.5;
}

/** The scene showing after scrolling `within` pixels past the point where the panel pins. */
export function sceneAt(within: number, step: number, count: number): number {
  if (count <= 0 || step <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(within / step)));
}

/** How far through its own stretch of scroll the scene at `index` is, from 0 to 1. */
export function sceneProgress(within: number, step: number, count: number, index: number): number {
  if (step <= 0) return 0;
  const start = Math.max(0, (index - 0.5) * step);
  const end = Math.min(trackSteps(count) * step, (index + 0.5) * step);
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (within - start) / (end - start)));
}

/** Where to scroll so the scene at `index` shows: the panel's pin point plus that scene's offset. */
export function sceneOffset(trackTop: number, step: number, index: number): number {
  return Math.round(trackTop + index * step);
}
