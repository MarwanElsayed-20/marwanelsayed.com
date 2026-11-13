import { describe, expect, it } from "vitest";
import { FRAME_WINDOW, FrameMonitor, WARMUP_FRAMES } from "./frame-monitor";

function feed(monitor: FrameMonitor, count: number, deltaMs: number) {
  const actions = [];
  for (let i = 0; i < count; i += 1) actions.push(monitor.push(deltaMs));
  return actions.filter((action) => action !== "none");
}

describe("FrameMonitor", () => {
  it("ignores the warm-up frames", () => {
    const monitor = new FrameMonitor();
    expect(feed(monitor, WARMUP_FRAMES + FRAME_WINDOW - 1, 100)).toEqual([]);
  });

  it("stays quiet when frames are fast", () => {
    const monitor = new FrameMonitor();
    expect(feed(monitor, WARMUP_FRAMES + FRAME_WINDOW * 3, 16)).toEqual([]);
  });

  it("asks to reduce the pixel ratio after the first slow window", () => {
    const monitor = new FrameMonitor();
    expect(feed(monitor, WARMUP_FRAMES + FRAME_WINDOW, 60)).toEqual(["reduce-pixel-ratio"]);
  });

  it("asks to fall back after a second consecutive slow window", () => {
    const monitor = new FrameMonitor();
    feed(monitor, WARMUP_FRAMES + FRAME_WINDOW, 60);
    expect(feed(monitor, FRAME_WINDOW, 60)).toEqual(["fallback"]);
  });

  it("resets the slow count after a healthy window", () => {
    const monitor = new FrameMonitor();
    feed(monitor, WARMUP_FRAMES + FRAME_WINDOW, 60);
    expect(feed(monitor, FRAME_WINDOW, 16)).toEqual([]);
    expect(feed(monitor, FRAME_WINDOW, 60)).toEqual(["reduce-pixel-ratio"]);
  });

  it("does not count long gaps such as pauses as slow frames", () => {
    const monitor = new FrameMonitor();
    feed(monitor, WARMUP_FRAMES, 16);
    expect(feed(monitor, FRAME_WINDOW * 2, 1000)).toEqual([]);
  });

  it("uses the median, so a few slow frames do not matter", () => {
    const monitor = new FrameMonitor();
    feed(monitor, WARMUP_FRAMES, 16);
    const actions = [];
    for (let i = 0; i < FRAME_WINDOW; i += 1) actions.push(monitor.push(i % 10 === 0 ? 200 : 16));
    expect(actions.filter((action) => action !== "none")).toEqual([]);
  });
});
