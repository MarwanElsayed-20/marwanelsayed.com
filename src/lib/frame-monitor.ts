/** Frames collected per decision window. */
export const FRAME_WINDOW = 120;
/** A window is "slow" when its median frame time is above this many milliseconds (below ~30 fps). */
export const SLOW_FRAME_MS = 34;
/** Frames ignored at the start (shader compilation, first uploads). */
export const WARMUP_FRAMES = 10;
/** Gaps longer than this (pauses, hidden tabs) are not counted as slow frames. */
export const MAX_COUNTED_GAP_MS = 250;

export type FrameAction = "none" | "reduce-pixel-ratio" | "fallback";

/**
 * Watches frame times. The first slow window asks to lower the pixel ratio; a second consecutive
 * slow window asks to fall back to the static visual. A healthy window resets the count.
 * These are graceful-degradation rules, not performance budgets.
 */
export class FrameMonitor {
  private deltas: number[] = [];
  private seen = 0;
  private slowWindows = 0;

  push(deltaMs: number): FrameAction {
    this.seen += 1;
    if (this.seen <= WARMUP_FRAMES) return "none";
    if (deltaMs > MAX_COUNTED_GAP_MS) return "none";

    this.deltas.push(deltaMs);
    if (this.deltas.length < FRAME_WINDOW) return "none";

    const sorted = [...this.deltas].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    this.deltas = [];

    if (median <= SLOW_FRAME_MS) {
      this.slowWindows = 0;
      return "none";
    }
    this.slowWindows += 1;
    return this.slowWindows === 1 ? "reduce-pixel-ratio" : "fallback";
  }
}
