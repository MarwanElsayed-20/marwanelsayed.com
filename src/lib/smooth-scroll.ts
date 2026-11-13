/**
 * The one smooth-scroll instance (see SmoothScroll). Overlays that lock the page stop it while
 * they are open, so wheel input cannot move the page behind them.
 */
type Smooth = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: number, options?: { duration?: number; immediate?: boolean }) => void;
};

let instance: Smooth | null = null;
let stopped = false;

export const smoothScroll = {
  set(next: Smooth | null) {
    instance = next;
    if (next && stopped) next.stop();
  },
  stop() {
    stopped = true;
    instance?.stop();
  },
  start() {
    stopped = false;
    instance?.start();
  },
  /** Glides to a scroll position: eased by Lenis when it runs, else the browser's own smooth scroll. */
  scrollTo(top: number, { immediate = false }: { immediate?: boolean } = {}) {
    if (instance) instance.scrollTo(top, { duration: 1.1, immediate });
    else window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
  },
};
