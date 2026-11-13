/**
 * The one motion vocabulary for the site. Every GSAP timeline takes its eases and durations from
 * here so the loader, menu, page transitions and reveals feel like one system.
 */
export const ease = {
  /** Decisive entrances: text lines, content settling into place. */
  out: "expo.out",
  /** Large surfaces covering or uncovering the screen: menu, page curtain. */
  inOut: "power4.inOut",
  /** Small supporting movement: captions, secondary text. */
  soft: "power3.out",
  /** A case study's scroll entrances: a section rising into place. */
  scene: "power3.out",
  /** A case study's hero capture opening out of its own centre. */
  open: "power3.inOut",
} as const;

/** Seconds. */
export const duration = {
  micro: 0.3,
  base: 0.6,
  long: 0.9,
} as const;

/** Safe on the server and in test environments without matchMedia. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
