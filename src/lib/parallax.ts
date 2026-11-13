/** Largest rotation, in radians, that pointer parallax adds in any direction. */
export const MAX_ROTATION = 0.3;
/** How quickly the form follows the pointer (per second; higher is snappier). */
export const DAMPING = 5;
/** Resting pose of the sculpture. */
export const BASE_ROTATION = { x: 0.35, y: -0.5 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Maps a pointer position inside a width by height box to -1..1 on each axis (y up is positive). */
export function normalizePointer(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  if (width <= 0 || height <= 0) return { x: 0, y: 0 };
  return {
    x: clamp((x / width) * 2 - 1, -1, 1),
    y: clamp(-((y / height) * 2 - 1), -1, 1),
  };
}

/** Frame-rate independent smoothing of `current` toward `target`. */
export function damp(
  current: number,
  target: number,
  lambda: number,
  deltaSeconds: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaSeconds));
}

/** Slow idle drift used on touch devices. */
export function driftAngles(timeSeconds: number): { x: number; y: number } {
  return { y: timeSeconds * 0.12, x: Math.sin(timeSeconds * 0.3) * 0.08 };
}
