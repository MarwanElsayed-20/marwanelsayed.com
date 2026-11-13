export const LOADER_STORAGE_KEY = "portfolio:intro-seen";
/** The intro never ends before this, so the counter is always readable. */
export const LOADER_MIN_MS = 2600;
/** The intro always ends by this, even if a resource never settles. */
export const LOADER_MAX_MS = 6000;

export const MOTION_STORAGE_KEY = "portfolio:motion";

/**
 * Runs in `<head>` before first paint. It sets two flags on <html>:
 * - `data-motion="on"` unless the visitor prefers reduced motion; CSS hides entrance targets only
 *   under this flag, so no-JS and reduced-motion visitors always see finished content.
 * - `data-loader`: the intro plays once per browser session and never with reduced motion.
 * A storage failure means "skip the intro", so nothing can block a visitor.
 */
export const loaderBootScript = `(function(){var d=document.documentElement,seen=false,off=false,reduced=false;try{reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}try{seen=sessionStorage.getItem("${LOADER_STORAGE_KEY}")==="1";off=sessionStorage.getItem("${MOTION_STORAGE_KEY}")==="off"}catch(e){seen=true}if(!reduced&&!off)d.dataset.motion="on";if(seen||reduced){d.dataset.loader="done"}else{d.dataset.loader="active";d.dataset.pageState="loading"}})();`;

/** `images`: every image in the first viewport has loaded (or failed; a failure never blocks). */
export type LoaderSteps = { hydrated: boolean; fonts: boolean; images: boolean };

/** Honest progress: each milestone is a real event, not a timer. Always reaches exactly 100. */
export function progressTarget({ hydrated, fonts, images }: LoaderSteps): number {
  return (hydrated ? 25 : 0) + (fonts ? 35 : 0) + (images ? 40 : 0);
}

/** Milliseconds to wait before finishing, given when the loader started and what has settled. */
export function remainingHold(elapsedMs: number, steps: LoaderSteps): number {
  if (progressTarget(steps) < 100) return Math.max(0, LOADER_MAX_MS - elapsedMs);
  return Math.max(0, LOADER_MIN_MS - elapsedMs);
}
