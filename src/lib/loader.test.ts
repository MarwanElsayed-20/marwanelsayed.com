import { describe, expect, it } from "vitest";
import {
  DESKTOP_TIMING,
  LOADER_MAX_MS,
  LOADER_MIN_MS,
  PHONE_TIMING,
  loaderBootScript,
  loaderTiming,
  progressTarget,
  remainingHold,
} from "./loader";

const none = { hydrated: false, fonts: false, images: false };
const all = { hydrated: true, fonts: true, images: true };

describe("progressTarget", () => {
  it("adds each real milestone and ends at exactly 100", () => {
    expect(progressTarget(none)).toBe(0);
    expect(progressTarget({ ...none, hydrated: true })).toBe(25);
    expect(progressTarget({ hydrated: true, fonts: true, images: false })).toBe(60);
    expect(progressTarget(all)).toBe(100);
  });
});

describe("remainingHold", () => {
  it("keeps the intro readable for the minimum time once everything is ready", () => {
    expect(remainingHold(300, all)).toBe(LOADER_MIN_MS - 300);
    expect(remainingHold(LOADER_MIN_MS + 500, all)).toBe(0);
  });

  it("never waits beyond the maximum when something is still pending", () => {
    expect(remainingHold(1000, none)).toBe(LOADER_MAX_MS - 1000);
    expect(remainingHold(LOADER_MAX_MS + 1, none)).toBe(0);
  });
});

describe("loaderTiming", () => {
  it("keeps the designed timing on larger screens", () => {
    expect(loaderTiming(false)).toBe(DESKTOP_TIMING);
    expect(DESKTOP_TIMING).toMatchObject({
      minMs: LOADER_MIN_MS,
      maxMs: LOADER_MAX_MS,
      exitSpeed: 1,
    });
  });

  it("runs the same sequence quicker on phones", () => {
    expect(loaderTiming(true)).toBe(PHONE_TIMING);
    expect(PHONE_TIMING.minMs).toBeLessThan(DESKTOP_TIMING.minMs);
    expect(PHONE_TIMING.maxMs).toBeLessThan(DESKTOP_TIMING.maxMs);
    expect(PHONE_TIMING.heroWaitMs).toBeLessThan(DESKTOP_TIMING.heroWaitMs);
    expect(PHONE_TIMING.cardRestS).toBeLessThan(DESKTOP_TIMING.cardRestS);
    expect(PHONE_TIMING.exitSpeed).toBeGreaterThan(1);
  });

  it("holds and caps a phone intro by the phone timing", () => {
    expect(remainingHold(300, all, PHONE_TIMING)).toBe(PHONE_TIMING.minMs - 300);
    expect(remainingHold(1000, none, PHONE_TIMING)).toBe(PHONE_TIMING.maxMs - 1000);
  });
});

describe("loaderBootScript", () => {
  const root = document.documentElement;
  const run = (reduced: boolean, setup: () => void = () => {}) => {
    root.removeAttribute("data-loader");
    root.removeAttribute("data-page-state");
    root.removeAttribute("data-motion");
    sessionStorage.clear();
    window.matchMedia = (() => ({ matches: reduced })) as unknown as typeof window.matchMedia;
    setup();
    new Function(loaderBootScript)();
    return { ...root.dataset };
  };

  it("activates the intro on a first visit", () => {
    expect(run(false)).toMatchObject({ loader: "active", pageState: "loading" });
  });

  it("skips the intro after it has been seen this session", () => {
    const result = run(false, () => sessionStorage.setItem("portfolio:intro-seen", "1"));
    expect(result.loader).toBe("done");
    expect(result.pageState).toBeUndefined();
  });

  it("skips the intro when reduced motion is requested", () => {
    expect(run(true).loader).toBe("done");
  });

  it("turns entrance motion on unless reduced motion is requested or it is switched off", () => {
    expect(run(false).motion).toBe("on");
    expect(run(true).motion).toBeUndefined();
    expect(
      run(false, () => sessionStorage.setItem("portfolio:motion", "off")).motion,
    ).toBeUndefined();
  });

  it("plays the intro only when the visit starts on the home page", () => {
    const start = window.location.pathname;
    try {
      for (const path of [
        "/websites-ecommerce/one-lax",
        "/saas-dashboards/aligna",
        "/about",
        "/services/websites",
        "/work",
      ]) {
        window.history.replaceState(null, "", path);
        const result = run(false);
        expect(result.loader, path).toBe("done");
        expect(result.pageState, path).toBeUndefined();
        // Counted as seen, so going on to the home page later in the visit does not start it.
        expect(sessionStorage.getItem("portfolio:intro-seen"), path).toBe("1");
      }
      window.history.replaceState(null, "", "/");
      expect(run(false)).toMatchObject({ loader: "active", pageState: "loading" });
    } finally {
      window.history.replaceState(null, "", start);
    }
  });

  it("skips the intro when storage throws", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      expect(run(false).loader).toBe("done");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
