export const LOADER_STORAGE_KEY = "portfolio:intro-seen";
/** The intro never ends before this, so the counter is always readable. */
export const LOADER_MIN_MS = 2600;
/** The intro always ends by this, even if a resource never settles. */
export const LOADER_MAX_MS = 6000;

/**
 * How long each part of the intro takes. Phones get the same sequence, quicker: visitors there
 * often arrive from a recruiter's message or a search on the go, and the full desktop timing kept
 * the home page hidden for about 8 seconds.
 */
export type LoaderTiming = {
  /** The counter shows for at least this long. */
  minMs: number;
  /** The intro ends by this even if something never settles. */
  maxMs: number;
  /** The longest wait for the hero scene to draw before the intro moves on. */
  heroWaitMs: number;
  /** Playback speed of the exit sequence (1 = as designed). */
  exitSpeed: number;
  /** Seconds the panel rests as a card before it slides away, at speed 1. */
  cardRestS: number;
};

export const DESKTOP_TIMING: LoaderTiming = {
  minMs: LOADER_MIN_MS,
  maxMs: LOADER_MAX_MS,
  heroWaitMs: 4500,
  exitSpeed: 1,
  cardRestS: 1.1,
};

export const PHONE_TIMING: LoaderTiming = {
  minMs: 1500,
  maxMs: 3500,
  heroWaitMs: 2000,
  exitSpeed: 1.6,
  cardRestS: 0.4,
};

/** Phones and small tablets in portrait: the same breakpoint as the site's `md`. */
export const PHONE_QUERY = "(max-width: 767px)";

export function loaderTiming(isPhone: boolean): LoaderTiming {
  return isPhone ? PHONE_TIMING : DESKTOP_TIMING;
}

export const MOTION_STORAGE_KEY = "portfolio:motion";

/**
 * Runs in `<head>` before first paint. It sets two flags on <html>:
 * - `data-motion="on"` unless the visitor prefers reduced motion; CSS hides entrance targets only
 *   under this flag, so no-JS and reduced-motion visitors always see finished content.
 * - `data-loader`: the intro plays once per browser session and never with reduced motion. It
 *   plays only when the visit starts on the home page: a visitor who lands on a case study, a
 *   service or /about came from a search result or a shared link for that content, so it shows at
 *   once, and the intro then counts as seen for the rest of the session.
 * A storage failure means "skip the intro", so nothing can block a visitor.
 */
export const loaderBootScript = `(function(){var d=document.documentElement,seen=false,off=false,reduced=false;try{reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}try{seen=sessionStorage.getItem("${LOADER_STORAGE_KEY}")==="1";off=sessionStorage.getItem("${MOTION_STORAGE_KEY}")==="off";if(!seen&&location.pathname!=="/"){seen=true;sessionStorage.setItem("${LOADER_STORAGE_KEY}","1")}}catch(e){seen=true}if(!reduced&&!off)d.dataset.motion="on";if(seen||reduced){d.dataset.loader="done"}else{d.dataset.loader="active";d.dataset.pageState="loading"}})();`;

/** `images`: every image in the first viewport has loaded (or failed; a failure never blocks). */
export type LoaderSteps = { hydrated: boolean; fonts: boolean; images: boolean };

/** Honest progress: each milestone is a real event, not a timer. Always reaches exactly 100. */
export function progressTarget({ hydrated, fonts, images }: LoaderSteps): number {
  return (hydrated ? 25 : 0) + (fonts ? 35 : 0) + (images ? 40 : 0);
}

/** Milliseconds to wait before finishing, given when the loader started and what has settled. */
export function remainingHold(
  elapsedMs: number,
  steps: LoaderSteps,
  timing: LoaderTiming = DESKTOP_TIMING,
): number {
  if (progressTarget(steps) < 100) return Math.max(0, timing.maxMs - elapsedMs);
  return Math.max(0, timing.minMs - elapsedMs);
}
