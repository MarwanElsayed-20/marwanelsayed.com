import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HeroSceneProps } from "./hero-scene";
import { HeroStage } from "./hero-stage";

const env = vi.hoisted(() => ({
  webgl: true,
  renders: 0,
  props: null as unknown,
}));

vi.mock("@/lib/webgl", () => ({ detectWebGL: () => env.webgl }));

vi.mock("@/components/hero/hero-scene", async () => {
  const React = await import("react");
  return {
    HeroScene: (props: HeroSceneProps) => {
      env.renders += 1;
      env.props = props;
      React.useEffect(() => {
        props.onReady();
      }, [props]);
      return React.createElement("div", { "data-testid": "scene" });
    },
  };
});

type Listener = (event: { matches: boolean }) => void;
const mediaListeners = new Map<string, Listener[]>();
const mediaMatches = new Map<string, boolean>();

function stubMatchMedia() {
  mediaListeners.clear();
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return mediaMatches.get(query) ?? false;
    },
    addEventListener: (_: string, listener: Listener) => {
      mediaListeners.set(query, [...(mediaListeners.get(query) ?? []), listener]);
    },
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

const observers: Array<(entry: { isIntersecting: boolean }) => void> = [];

class FakeIntersectionObserver {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    const emit = (entry: { isIntersecting: boolean }) =>
      this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    observers.push(emit);
    emit({ isIntersecting: true });
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function setConnection(value: object | undefined) {
  Object.defineProperty(navigator, "connection", { configurable: true, value });
}

function stage(container: HTMLElement) {
  return container.querySelector("[data-hero-stage]") as HTMLElement;
}

beforeEach(() => {
  env.webgl = true;
  env.renders = 0;
  env.props = null;
  observers.length = 0;
  mediaMatches.clear();
  stubMatchMedia();
  setConnection(undefined);
  window.history.pushState({}, "", "/");
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    FakeIntersectionObserver;
  delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
});

afterEach(cleanup);

describe("HeroStage", () => {
  it("renders the static fallback first, with the state attributes", () => {
    const { container } = render(<HeroStage />);
    const el = stage(container);
    expect(el.getAttribute("data-hero-state")).toBe("fallback");
    expect(el.getAttribute("data-hero-reason")).toBe("");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.querySelector("svg")).not.toBeNull();
  });

  it("loads the scene and becomes ready on a capable visitor", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    expect(env.renders).toBeGreaterThan(0);
    expect(stage(container).getAttribute("data-hero-reason")).toBe("");
  });

  it.each([
    ["forced colors", () => mediaMatches.set("(forced-colors: active)", true), "forced"],
    [
      "reduced motion",
      () => mediaMatches.set("(prefers-reduced-motion: reduce)", true),
      "reduced-motion",
    ],
    ["data-saver", () => setConnection({ saveData: true }), "data-saver"],
    ["a 2g connection", () => setConnection({ effectiveType: "2g" }), "slow-connection"],
    ["missing WebGL", () => (env.webgl = false), "no-webgl"],
  ])("falls back without loading the scene for %s", async (_name, arrange, reason) => {
    arrange();
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-reason")).toBe(reason));
    expect(stage(container).getAttribute("data-hero-state")).toBe("fallback");
    expect(env.renders).toBe(0);
  });

  it("honors the forced fallback switch", async () => {
    window.history.pushState({}, "", "/?hero=fallback");
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-reason")).toBe("forced"));
    expect(env.renders).toBe(0);
  });

  it("falls back when the scene fails to load (fail switch)", async () => {
    window.history.pushState({}, "", "/?hero=fail");
    const { container } = render(<HeroStage />);
    await waitFor(() =>
      expect(stage(container).getAttribute("data-hero-reason")).toBe("load-failed"),
    );
    expect(stage(container).getAttribute("data-hero-state")).toBe("fallback");
  });

  it("stays in the loading state with the hold switch", async () => {
    window.history.pushState({}, "", "/?hero=hold");
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("loading"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(stage(container).getAttribute("data-hero-state")).toBe("loading");
    expect(env.renders).toBe(0);
  });

  it("falls back when the scene reports a lost context", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    act(() => (env.props as HeroSceneProps).onContextLost());
    await waitFor(() =>
      expect(stage(container).getAttribute("data-hero-reason")).toBe("context-lost"),
    );
    expect(container.querySelector("[data-hero-scene]")).toBeNull();
  });

  it("falls back when the scene reports low performance", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    act(() => (env.props as HeroSceneProps).onLowPerformance());
    await waitFor(() =>
      expect(stage(container).getAttribute("data-hero-reason")).toBe("low-performance"),
    );
  });

  it("falls back when reduced motion is turned on later", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    const listeners = mediaListeners.get("(prefers-reduced-motion: reduce)") ?? [];
    expect(listeners.length).toBeGreaterThan(0);
    act(() => listeners.forEach((listener) => listener({ matches: true })));
    await waitFor(() =>
      expect(stage(container).getAttribute("data-hero-reason")).toBe("reduced-motion"),
    );
  });

  it("pauses when the stage leaves the viewport and resumes when it returns", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    expect(stage(container).getAttribute("data-hero-paused")).toBe("false");
    act(() => observers.forEach((emit) => emit({ isIntersecting: false })));
    await waitFor(() => expect(stage(container).getAttribute("data-hero-paused")).toBe("true"));
    act(() => observers.forEach((emit) => emit({ isIntersecting: true })));
    await waitFor(() => expect(stage(container).getAttribute("data-hero-paused")).toBe("false"));
  });

  it("never retries the scene after a fallback in the same page view", async () => {
    const { container } = render(<HeroStage />);
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("ready"));
    act(() => (env.props as HeroSceneProps).onContextLost());
    await waitFor(() => expect(stage(container).getAttribute("data-hero-state")).toBe("fallback"));
    const rendersAtFallback = env.renders;
    act(() => observers.forEach((emit) => emit({ isIntersecting: true })));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(env.renders).toBe(rendersAtFallback);
    expect(stage(container).getAttribute("data-hero-reason")).toBe("context-lost");
  });
});
