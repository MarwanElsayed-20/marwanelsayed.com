/**
 * The logos of the contact band fly up and fall back: launched from
 * just below the band with an upward push and a slow spin, then pulled back down by gravity, with
 * no floor and no collisions between them. Everything is in pixels and seconds; gravity scales
 * with the band so a tall band and a short one feel alike.
 */
export type Flight = {
  /** Centre of the logo. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radians, positive turning counter-clockwise. */
  angle: number;
  spin: number;
  size: number;
};

/** Screens per second squared: about one screen height per second, every second. */
export const GRAVITY_PER_HEIGHT = 1;
/** How high a launch can climb, as a share of the band: from a little under half to its full height. */
export const APEX_RANGE: readonly [number, number] = [0.45, 1];
export const SPIN_RANGE: readonly [number, number] = [0.6, 1.8];

export const gravityFor = (height: number): number => GRAVITY_PER_HEIGHT * height;

const between = (range: readonly [number, number], random: () => number): number =>
  range[0] + (range[1] - range[0]) * random();

/** A new flight: a random place along the bottom edge, just out of sight, climbing to a random height. */
export function launch(
  width: number,
  height: number,
  size: number,
  random: () => number = Math.random,
): Flight {
  const apex = between(APEX_RANGE, random) * height;
  const margin = Math.min(size / 2, width / 2);
  return {
    x: margin + random() * Math.max(0, width - 2 * margin),
    y: height + size / 2,
    vx: 0,
    vy: -Math.sqrt(2 * gravityFor(height) * apex),
    angle: 0,
    spin: between(SPIN_RANGE, random),
    size,
  };
}

/** Moves a flight forward by `dt` seconds. */
export function step(flight: Flight, dt: number, height: number): void {
  flight.vy += gravityFor(height) * dt;
  flight.x += flight.vx * dt;
  flight.y += flight.vy * dt;
  flight.angle += flight.spin * dt;
}

/** True once a flight is falling below the band again and out of sight. */
export const isGone = (flight: Flight, height: number): boolean =>
  flight.vy > 0 && flight.y - flight.size / 2 > height;

/** A touch: a logo that is hovered gets one extra upward push and a faster spin. */
export function poke(flight: Flight, height: number): void {
  flight.vy -= 0.45 * Math.sqrt(2 * gravityFor(height) * height);
  flight.spin += flight.spin >= 0 ? 1.2 : -1.2;
}

/** The apex a flight launched with `vy` reaches, measured upward from where it started. */
export const apexOf = (vy: number, height: number): number => (vy * vy) / (2 * gravityFor(height));
