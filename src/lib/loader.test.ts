import { describe, expect, it } from "vitest";
import {
  LOADER_MAX_MS,
  LOADER_MIN_MS,
  loaderBootScript,
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
