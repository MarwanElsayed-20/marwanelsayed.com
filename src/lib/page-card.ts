import gsap from "gsap";

/** Corner radius of the page card, in pixels of the (unscaled) page. */
export const CARD_RADIUS = 28;
export const CARD_SCALE = 0.9;

/**
 * The page drawn as a rounded card that holds only what is on screen right now. The page shell is
 * taller than the screen, so the card is a clip of the viewport's slice of it, scaled about the
 * viewport's vertical centre. `shift` is how far the card slides sideways, as a share of the width.
 */
export function cardGeometry(shell: HTMLElement, shift: number, originX = "0px") {
  const viewport = window.innerHeight;
  const top = window.scrollY;
  const bottom = Math.max(0, shell.offsetHeight - top - viewport);
  const clip = (corner: number) => `inset(${top}px 0px ${bottom}px 0px round ${corner}px)`;
  return {
    origin: `${originX} ${top + viewport / 2}px`,
    flat: clip(0),
    card: clip(CARD_RADIUS),
    top,
    bottom,
    x: -window.innerWidth * shift,
  };
}

export type CardSlot = "left" | "centre" | "right";

/** Where the card sits sideways: in the middle, or one screen to the left or right of it. */
export function cardSlot(slot: CardSlot): number {
  const centre = (window.innerWidth * (1 - CARD_SCALE)) / 2;
  if (slot === "left") return centre - window.innerWidth;
  if (slot === "right") return centre + window.innerWidth;
  return centre;
}

/** Puts the page, as it is right now, in the shape of a card at the given slot. */
export function poseCard(shell: HTMLElement, slot: CardSlot) {
  const geometry = cardGeometry(shell, 0);
  gsap.set(shell, {
    transformOrigin: geometry.origin,
    clipPath: geometry.card,
    scale: CARD_SCALE,
    x: cardSlot(slot),
    opacity: 1,
  });
  return geometry;
}

/**
 * Grows the card's clip past the screen edges so its round corners leave the screen. GSAP must
 * not interpolate the clip-path string itself (it drops the `round` keyword and the radius is then
 * read as a left inset), so a plain number is tweened and the string is written here.
 */
export function growClip(shell: HTMLElement, geometry: () => { top: number; bottom: number }) {
  const state = { grow: 0 };
  return {
    target: state,
    vars: {
      grow: CARD_RADIUS + 4,
      onUpdate: () => {
        const { top, bottom } = geometry();
        const g = state.grow;
        shell.style.clipPath = `inset(${top - g}px ${-g}px ${bottom - g}px ${-g}px round ${CARD_RADIUS}px)`;
      },
    },
  };
}
