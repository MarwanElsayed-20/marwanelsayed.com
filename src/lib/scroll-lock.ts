import { smoothScroll } from "@/lib/smooth-scroll";

let holders = 0;
let restore: (() => void) | null = null;

/**
 * Locks page scrolling and returns an idempotent release function. Locks are counted, so two
 * overlays that overlap cannot unlock the page while the other is still open.
 */
export function lockScroll(): () => void {
  if (holders === 0) {
    const root = document.documentElement;
    const { overflow, paddingRight } = root.style;
    const gutter = window.innerWidth - root.clientWidth;
    smoothScroll.stop();
    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;
    restore = () => {
      smoothScroll.start();
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
    };
  }
  holders += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders === 0) {
      restore?.();
      restore = null;
    }
  };
}
