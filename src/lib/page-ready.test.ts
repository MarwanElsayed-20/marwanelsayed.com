import { afterEach, describe, expect, it, vi } from "vitest";
import { announceArrival, hasArrived, onPageArrived, setPageState } from "./page-ready";

const html = document.documentElement;

afterEach(() => {
  delete html.dataset.loader;
  delete html.dataset.pageTransition;
  delete html.dataset.pageState;
  vi.useRealTimers();
});

describe("hasArrived", () => {
  it("is true when nothing covers the page", () => {
    expect(hasArrived()).toBe(true);
  });

  it("is false while the loader, a page change or an unready page is in the way", () => {
    html.dataset.loader = "active";
    expect(hasArrived()).toBe(false);
    html.dataset.loader = "done";
    html.dataset.pageTransition = "true";
    expect(hasArrived()).toBe(false);
    delete html.dataset.pageTransition;
    setPageState("entering");
    expect(hasArrived()).toBe(false);
    setPageState("ready");
    expect(hasArrived()).toBe(true);
  });
});

describe("onPageArrived", () => {
  it("waits for the signal while the page is covered, then runs once", async () => {
    html.dataset.pageTransition = "true";
    const callback = vi.fn();
    onPageArrived(callback);
    announceArrival();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(callback).not.toHaveBeenCalled();
    delete html.dataset.pageTransition;
    announceArrival();
    await new Promise((resolve) => setTimeout(resolve, 50));
    announceArrival();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs at once when the page is already uncovered", async () => {
    const callback = vi.fn();
    onPageArrived(callback);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("after the timeout runs only once nothing covers the page, and a cancelled wait never runs", () => {
    vi.useFakeTimers();
    html.dataset.loader = "active";
    const late = vi.fn();
    onPageArrived(late, 1000);
    const cancelled = vi.fn();
    onPageArrived(cancelled, 1000)();
    vi.advanceTimersByTime(5000);
    expect(late).not.toHaveBeenCalled();
    html.dataset.loader = "done";
    vi.advanceTimersByTime(2000);
    expect(late).toHaveBeenCalledTimes(1);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it("runs after the hard limit even if the cover never lifts", () => {
    vi.useFakeTimers();
    html.dataset.loader = "active";
    const stuck = vi.fn();
    onPageArrived(stuck, 1000);
    vi.advanceTimersByTime(119_000);
    expect(stuck).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(stuck).toHaveBeenCalledTimes(1);
  });
});
