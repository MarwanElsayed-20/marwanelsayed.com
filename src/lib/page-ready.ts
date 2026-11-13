/** Fired on `window` when the loader or a page transition has finished uncovering the page. */
export const READY_EVENT = "site:ready";

export type PageState = "loading" | "entering" | "ready";

/**
 * `html[data-page-state]` is the shared signal between the loader, page transitions and any
 * entrance animation. An absent attribute means ready, so no-JS visitors and skipped intros work.
 */
export function pageState(): PageState {
  const value = document.documentElement.dataset.pageState;
  return value === "loading" || value === "entering" ? value : "ready";
}

export function setPageState(state: PageState): void {
  document.documentElement.dataset.pageState = state;
  if (state === "ready") window.dispatchEvent(new Event(READY_EVENT));
}

/** Runs `callback` once the page is uncovered (now, if it already is). Returns a canceller. */
export function onPageReady(callback: () => void): () => void {
  if (pageState() === "ready") {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  }
  const handler = () => callback();
  window.addEventListener(READY_EVENT, handler, { once: true });
  return () => window.removeEventListener(READY_EVENT, handler);
}

/** Fired on `window` once the page has finished growing to fill the screen (see `hasArrived`). */
export const ARRIVED_EVENT = "site:arrived";

/**
 * True when nothing covers the page any more: the loader is done, no page change is playing and
 * the page is ready. `onPageReady` fires earlier, while the page still waits beside the screen as
 * a card, which is right for work that should be finished by the time it arrives.
 */
export function hasArrived(): boolean {
  const html = document.documentElement;
  return (
    html.dataset.loader !== "active" &&
    html.dataset.pageTransition !== "true" &&
    pageState() === "ready"
  );
}

/** Called by the loader and the page transition when they let go of the page. */
export function announceArrival(): void {
  window.dispatchEvent(new Event(ARRIVED_EVENT));
}

/**
 * Runs `callback` once the page has arrived on screen (now, if it already has), so an entrance
 * that should be watched is not played under the loader or the "Loading" card. If the signal
 * never comes it runs after `timeoutMs`, but only once nothing is covering the page any more, and
 * in any case after `MAX_WAIT_MS` (a slow device can take a long time to finish the cover).
 * Returns a canceller.
 */
export function onPageArrived(callback: () => void, timeoutMs = 10_000): () => void {
  if (hasArrived()) {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  }
  const started = Date.now();
  let done = false;
  let timer: number | undefined;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    callback();
  };
  const arm = (ms: number) => {
    timer = window.setTimeout(() => {
      if (hasArrived() || Date.now() - started >= MAX_WAIT_MS) run();
      else arm(2000);
    }, ms);
  };
  arm(timeoutMs);
  // The signal fires as the cover lifts; wait a frame so the page is on screen when it starts.
  const handler = () => {
    if (hasArrived()) requestAnimationFrame(run);
  };
  const cleanup = () => {
    window.clearTimeout(timer);
    window.removeEventListener(ARRIVED_EVENT, handler);
  };
  window.addEventListener(ARRIVED_EVENT, handler);
  return () => {
    done = true;
    cleanup();
  };
}

const MAX_WAIT_MS = 120_000;
