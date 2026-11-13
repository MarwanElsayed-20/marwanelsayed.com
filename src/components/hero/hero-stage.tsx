"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { HeroErrorBoundary } from "@/components/hero/hero-error-boundary";
import { HeroFallback, type FallbackIcon } from "@/components/hero/hero-fallback";
import { useHeroBlocks } from "@/components/hero/hero-blocks";
import type { HeroSceneProps } from "@/components/hero/hero-scene";
import { cn } from "@/lib/cn";
import { readConnection, shouldLoadScene, type HeroReason } from "@/lib/hero-capability";
import { parseHeroSwitch } from "@/lib/hero-switch";
import { detectWebGL } from "@/lib/webgl";

type StageState = "fallback" | "loading" | "ready";
type SceneComponent = ComponentType<HeroSceneProps>;

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 1);
  return () => window.clearTimeout(id);
}

/**
 * Reserved visual area of the hero. Always starts as the static fallback (server-rendered), then
 * decides after mount whether to lazy-load the 3D scene. State is exposed through data attributes.
 */
export function HeroStage({ icons = [] }: { icons?: readonly FallbackIcon[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const seamsRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  const [state, setState] = useState<StageState>("fallback");
  const [reason, setReason] = useState<HeroReason | null>(null);
  const [paused, setPaused] = useState(false);
  const [fine, setFine] = useState(false);
  const [simulateSlow, setSimulateSlow] = useState(false);
  const [Scene, setScene] = useState<SceneComponent | null>(null);

  const goFallback = useCallback((why: HeroReason) => {
    if (settled.current) return;
    settled.current = true;
    if (stageRef.current) stageRef.current.dataset.heroFrames = "0";
    setScene(null);
    setState("fallback");
    setReason(why);
  }, []);

  const handleReady = useCallback(() => {
    if (!settled.current) setState("ready");
  }, []);

  const handleFrame = useCallback((count: number) => {
    if (!settled.current && stageRef.current) stageRef.current.dataset.heroFrames = String(count);
  }, []);

  useHeroBlocks({ stage: stageRef, content: contentRef, seams: seamsRef, labels: labelsRef });

  useEffect(() => {
    const stage = stageRef.current;
    let cancelled = false;
    let started = false;
    let observer: IntersectionObserver | null = null;
    let visible = true;
    let inView = true;
    let menuOpen = false;
    const cleanups: Array<() => void> = [];

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePaused = () => setPaused(!(visible && inView) || menuOpen);

    const begin = () => {
      if (cancelled || !stage) return;
      if (forcedColors.matches) {
        goFallback("forced");
        return;
      }
      const heroSwitch = parseHeroSwitch(window.location.search);
      const decision = shouldLoadScene({
        switch: heroSwitch,
        reducedMotion: reduced.matches,
        ...readConnection(navigator),
        webgl: detectWebGL,
      });
      if (!decision.load) {
        goFallback(decision.reason);
        return;
      }

      setFine(pointerQuery.matches);
      setSimulateSlow(heroSwitch === "lowperf");

      const onReducedChange = (event: MediaQueryListEvent) => {
        if (event.matches) goFallback("reduced-motion");
      };
      reduced.addEventListener("change", onReducedChange);
      cleanups.push(() => reduced.removeEventListener("change", onReducedChange));

      const onForcedColorsChange = (event: MediaQueryListEvent) => {
        if (event.matches) goFallback("forced");
      };
      forcedColors.addEventListener("change", onForcedColorsChange);
      cleanups.push(() => forcedColors.removeEventListener("change", onForcedColorsChange));

      const onPointerChange = (event: MediaQueryListEvent) => setFine(event.matches);
      pointerQuery.addEventListener("change", onPointerChange);
      cleanups.push(() => pointerQuery.removeEventListener("change", onPointerChange));

      const onVisibility = () => {
        visible = document.visibilityState === "visible";
        updatePaused();
      };
      visible = document.visibilityState === "visible";
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

      // While the menu opens or closes the scene rests so those tweens have the frame; once the
      // menu has settled it carries on, since the page card stays in view beside the list.
      const root = document.documentElement;
      let resume: ReturnType<typeof setTimeout> | undefined;
      const menuObserver = new MutationObserver(() => {
        clearTimeout(resume);
        menuOpen = true;
        updatePaused();
        resume = setTimeout(() => {
          menuOpen = false;
          updatePaused();
        }, 1000);
      });
      menuObserver.observe(root, { attributes: true, attributeFilter: ["data-menu-open"] });
      cleanups.push(() => {
        clearTimeout(resume);
        menuObserver.disconnect();
      });

      const load = () => {
        if (started || cancelled || settled.current) return;
        started = true;
        setState("loading");
        if (heroSwitch === "hold") return;
        const loading =
          heroSwitch === "fail"
            ? Promise.reject(new Error("Forced scene failure (review switch)"))
            : import("@/components/hero/hero-scene");
        loading
          .then((module) => {
            if (!cancelled && !settled.current) setScene(() => module.HeroScene);
          })
          .catch(() => {
            if (!cancelled) goFallback("load-failed");
          });
      };

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          inView = entry.isIntersecting;
          updatePaused();
          if (entry.isIntersecting) load();
        },
        { rootMargin: "200px 150% 200px 150%" },
      );
      observer.observe(stage);
    };

    const cancelIdle = scheduleIdle(begin);

    return () => {
      cancelled = true;
      cancelIdle();
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [goFallback]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={stageRef}
        data-hero-stage
        data-surface="dark"
        data-hero-state={state}
        data-hero-reason={reason ?? ""}
        data-hero-paused={String(paused)}
        data-hero-frames="0"
        aria-hidden="true"
        className="pointer-events-none relative min-h-32 w-full flex-1"
      >
        <div
          ref={contentRef}
          data-hero-content
          className="absolute inset-0 overflow-hidden rounded-xl bg-foreground"
        >
          <div data-silk />
          <div data-hero-sheen aria-hidden="true" />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-(--duration-base) ease-standard print:opacity-100 print:transition-none",
              state === "ready" && "opacity-0",
            )}
          >
            <HeroFallback icons={icons} />
          </div>
          <div
            ref={seamsRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 print:hidden"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                data-hero-seam
                style={{ display: "none" }}
                className="absolute top-0 left-0"
              />
            ))}
          </div>
          {Scene && state !== "fallback" ? (
            <div
              data-hero-scene
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-(--duration-base) ease-standard print:hidden",
                state === "ready" && "opacity-100",
              )}
            >
              <HeroErrorBoundary onError={() => goFallback("load-failed")}>
                <Scene
                  paused={paused}
                  fine={fine}
                  simulateSlow={simulateSlow}
                  onReady={handleReady}
                  onFrame={handleFrame}
                  onContextLost={() => goFallback("context-lost")}
                  onLowPerformance={() => goFallback("low-performance")}
                />
              </HeroErrorBoundary>
            </div>
          ) : null}
        </div>
      </div>
      <div
        ref={labelsRef}
        aria-hidden="true"
        className="relative mt-2 h-[1.5em] shrink-0 overflow-hidden text-[clamp(0.75rem,1.25vw,2rem)] leading-[1.5] font-bold tracking-tight whitespace-nowrap"
      >
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            data-hero-label
            data-ghost={String(index % 2 === 0)}
            style={{ left: `${(index * 100) / 3.25 - 100 / 3.25}%`, width: `${100 / 3.25}%` }}
            className="absolute top-0 text-center"
          >
            Scroll Down
          </span>
        ))}
      </div>
    </div>
  );
}
