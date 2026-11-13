"use client";

import gsap from "gsap";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { duration, ease } from "@/lib/motion";
import { onPageReady } from "@/lib/page-ready";
import { smoothScroll } from "@/lib/smooth-scroll";
import { STEP, sceneAt, sceneOffset, sceneProgress, trackSteps } from "@/lib/work-stage";

/** Must match the pinned-panel rule in globals.css. */
const PINNED_QUERY = "(min-width: 1024px) and (min-height: 560px)";
/** How far the panel washes over between two scenes. */
const WASH = 0.85;

const cssVar = (element: Element, name: string) =>
  getComputedStyle(element).getPropertyValue(name).trim();

function partsOf(scene: HTMLElement) {
  const lines = [...scene.querySelectorAll<SVGPathElement>("[data-art-lines] path")];
  return {
    text: [...scene.querySelectorAll<HTMLElement>("[data-scene-part], [data-scene-title]")],
    title: scene.querySelector<HTMLElement>("[data-scene-title]"),
    label: scene.querySelector<HTMLElement>("[data-scene-part]"),
    pieces: [...scene.querySelectorAll<HTMLElement>("[data-art-piece]")],
    objects: [...scene.querySelectorAll<HTMLElement>("[data-art-object]")],
    solid: lines.filter((line) => !line.hasAttribute("stroke-dasharray")),
    dashed: lines.filter((line) => line.hasAttribute("stroke-dasharray")),
    dots: [...scene.querySelectorAll<HTMLElement>("[data-art-dot]")],
    captions: [...scene.querySelectorAll<HTMLElement>("[data-art-caption]")],
    texture: scene.querySelector<HTMLElement>("[data-scene-texture]"),
  };
}

const everything = (scene: HTMLElement) => {
  const parts = partsOf(scene);
  return [
    ...parts.text,
    ...parts.pieces,
    ...parts.objects,
    ...parts.solid,
    ...parts.dashed,
    ...parts.dots,
    ...parts.captions,
    ...(parts.texture ? [parts.texture] : []),
  ];
};

/** Puts a scene's pieces where its entrance starts, so nothing flashes before it plays. */
function prepare(scene: HTMLElement) {
  const parts = partsOf(scene);
  gsap.set(parts.text, { opacity: 0, x: 48 });
  if (parts.title) gsap.set(parts.title, { color: cssVar(scene, "--scene-muted") });
  gsap.set(parts.pieces, { opacity: 0, x: 72 });
  gsap.set(parts.objects, { opacity: 0, y: -40, rotation: -5 });
  gsap.set(parts.solid, { strokeDasharray: "1 1", strokeDashoffset: 1 });
  gsap.set([...parts.dashed, ...parts.captions], { opacity: 0 });
  gsap.set(parts.dots, { scale: 0, transformOrigin: "50% 50%" });
  if (parts.texture) gsap.set(parts.texture, { opacity: 0 });
}

/** Clears everything a scene's motion wrote, back to its stylesheet look. */
function reset(scene: HTMLElement) {
  const all = everything(scene);
  gsap.killTweensOf(all);
  gsap.set(all, {
    clearProps: "opacity,transform,color,strokeDasharray,strokeDashoffset",
  });
}

/**
 * A scene arriving: the texture, then the text sliding in from the right with the title
 * darkening from a pale grey to its colour, then the captures, the object, the lines drawing
 * themselves and the captions last.
 */
function enter(scene: HTMLElement) {
  const parts = partsOf(scene);
  prepare(scene);
  const timeline = gsap.timeline();
  if (parts.texture)
    timeline.to(parts.texture, { opacity: 1, duration: duration.base, ease: ease.soft }, 0);
  timeline.to(
    parts.text,
    { opacity: 1, x: 0, duration: duration.long + 0.2, ease: ease.out, stagger: 0.05 },
    0.02,
  );
  if (parts.title)
    timeline.to(
      parts.title,
      { color: cssVar(scene, "--scene-title"), duration: duration.base, ease: ease.soft },
      0.12,
    );
  timeline
    .to(parts.pieces, { opacity: 1, x: 0, duration: 1, ease: ease.out, stagger: 0.08 }, 0.16)
    .to(parts.objects, { opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: ease.out }, 0.34)
    .to(parts.solid, { strokeDashoffset: 0, duration: 0.7, ease: ease.inOut }, 0.32)
    .to(parts.dashed, { opacity: 1, duration: 0.5, ease: ease.soft }, 0.45)
    .to(parts.dots, { scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 0.8)
    .to(parts.captions, { opacity: 1, duration: 0.5, ease: ease.soft, stagger: 0.1 }, 0.62);
  timeline.eventCallback("onComplete", () => reset(scene));
  return timeline;
}

/** A scene leaving: its accent drains, then everything slides out to the left and fades. */
function leave(scene: HTMLElement) {
  const parts = partsOf(scene);
  const pale = cssVar(scene, "--scene-muted");
  const timeline = gsap.timeline();
  timeline.to(
    [parts.title, parts.label].filter((item): item is HTMLElement => item !== null),
    { color: pale, duration: 0.22, ease: ease.soft },
    0,
  );
  timeline.to(
    parts.text,
    { opacity: 0, x: -32, duration: 0.34, ease: "power2.in", stagger: 0.03 },
    0.04,
  );
  timeline.to(
    [
      ...parts.pieces,
      ...parts.objects,
      ...parts.solid,
      ...parts.dashed,
      ...parts.dots,
      ...parts.captions,
      ...(parts.texture ? [parts.texture] : []),
    ],
    { opacity: 0, duration: 0.3, ease: "power2.in" },
    0,
  );
  timeline.to([...parts.pieces, ...parts.objects], { x: -24, duration: 0.3, ease: "power2.in" }, 0);
  return timeline;
}

/**
 * Starts the dots that travel along the scenes' lines (SVG motion paths). They only run, and only
 * show, while motion is on; each waits its own delay first.
 */
function startTravellers(track: HTMLElement): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const travellers = [...track.querySelectorAll<SVGCircleElement>("[data-art-traveller]")];
  for (const traveller of travellers) {
    const motion = traveller.querySelector<SVGAnimationElement>("animateMotion");
    if (!motion || typeof motion.beginElement !== "function") continue;
    timers.push(
      setTimeout(
        () => {
          traveller.setAttribute("opacity", "1");
          motion.beginElement();
        },
        Number(traveller.dataset.delay ?? 0) * 1000,
      ),
    );
  }
  return () => {
    timers.forEach(clearTimeout);
    for (const traveller of travellers) {
      traveller.setAttribute("opacity", "0");
      traveller.querySelector<SVGAnimationElement>("animateMotion")?.endElement?.();
    }
  };
}

/** Wide screens with motion: one pinned panel whose scenes change as the page scrolls. */
function pin(track: HTMLElement, count: number): () => void {
  const card = track.querySelector<HTMLElement>("[data-work-card]")!;
  const wash = track.querySelector<HTMLElement>("[data-work-wash]")!;
  const counter = track.querySelector<HTMLElement>("[data-work-count]");
  const scenes = [...track.querySelectorAll<HTMLElement>("[data-scene]")];
  const tabs = [...track.querySelectorAll<HTMLElement>("[data-work-tab]")];
  const bars = tabs.map((tab) => tab.querySelector<HTMLElement>("[data-tab-progress]"));
  const hairs = [...track.querySelectorAll<HTMLElement>("[data-hairline]")];
  const step = () => window.innerHeight * STEP;
  const within = () => -track.getBoundingClientRect().top;
  const trackTop = () => track.getBoundingClientRect().top + window.scrollY;

  let shown = -1;
  let target = 0;
  let leaving: gsap.core.Timeline | null = null;
  let entering: gsap.core.Timeline | null = null;
  let frame: number | undefined;
  let quietFocus = false;

  const update = () => {
    frame = undefined;
    const now = within();
    target = sceneAt(now, step(), count);
    bars.forEach((bar, i) => {
      if (bar)
        bar.style.transform = `scaleX(${i === shown ? sceneProgress(now, step(), count, i) : 0})`;
    });
    if (shown >= 0) change();
  };
  const schedule = () => {
    if (frame === undefined) frame = requestAnimationFrame(update);
  };

  const mark = (index: number) => {
    const scene = scenes[index];
    card.dataset.tone = scene.dataset.tone;
    if (scene.dataset.surface) card.dataset.surface = scene.dataset.surface;
    else delete card.dataset.surface;
    if (counter) counter.textContent = String(index + 1).padStart(2, "0");
    scenes.forEach((item, i) => item.toggleAttribute("data-active", i === index));
    hairs.forEach((item, i) => item.toggleAttribute("data-active", i === index));
    tabs.forEach((tab, i) => {
      if (i === index) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    });
    shown = index;
    schedule();
  };

  const change = () => {
    if (leaving || target === shown) return;
    if (entering) {
      entering.progress(1);
      entering = null;
    }
    const from = scenes[shown];
    leaving = gsap.timeline({
      onComplete: () => {
        leaving = null;
        reset(from);
        mark(target);
        gsap.set(card, { clearProps: "backgroundColor" });
        entering = gsap
          .timeline({ onComplete: () => void (entering = null) })
          .to(wash, { opacity: 0, duration: 0.45, ease: "power2.out" }, 0)
          .add(enter(scenes[shown]), 0.02);
        if (target !== shown) change();
      },
    });
    leaving
      .add(leave(from), 0)
      .to(wash, { opacity: WASH, duration: 0.3, ease: "power2.in" }, 0)
      .to(
        card,
        { backgroundColor: cssVar(scenes[target], "--scene-bg"), duration: 0.3, ease: "none" },
        0,
      );
  };

  // The panel's first arrival plays the first scene's entrance; arriving mid-way shows the scene
  // at once (for example after a reload further down the page).
  let observer: IntersectionObserver | null = null;
  let cancelReady = () => {};
  const firstIndex = sceneAt(within(), step(), count);
  if (track.getBoundingClientRect().top > window.innerHeight * 0.6) {
    mark(0);
    prepare(scenes[0]);
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        cancelReady = onPageReady(() => {
          if (!leaving && shown === 0) entering = enter(scenes[0]);
        });
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(track);
  } else {
    mark(firstIndex);
  }
  target = shown;

  // Tabs and the intro prints jump to a scene's own stretch of scroll, not to its element.
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    const id = link?.getAttribute("href")?.match(/^#scene-(.+)$/)?.[1];
    const index = scenes.findIndex((scene) => scene.dataset.scene === id);
    if (index < 0) return;
    event.preventDefault();
    smoothScroll.scrollTo(sceneOffset(trackTop(), step(), index));
    quietFocus = true;
    scenes[index].focus({ preventScroll: true });
    quietFocus = false;
  };
  // Keyboard focus landing in a scene that is not showing brings that scene in.
  const onFocus = (event: FocusEvent) => {
    if (quietFocus) return;
    const scene = (event.target as Element).closest<HTMLElement>("[data-scene]");
    const index = scene ? scenes.indexOf(scene) : -1;
    if (index >= 0 && index !== target)
      smoothScroll.scrollTo(sceneOffset(trackTop(), step(), index), { immediate: true });
  };

  window.addEventListener("click", onClick, true);
  track.addEventListener("focusin", onFocus);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    window.removeEventListener("click", onClick, true);
    track.removeEventListener("focusin", onFocus);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame !== undefined) cancelAnimationFrame(frame);
    observer?.disconnect();
    cancelReady();
    leaving?.kill();
    entering?.kill();
    gsap.killTweensOf([card, wash]);
    gsap.set([card, wash], { clearProps: "backgroundColor,opacity" });
    scenes.forEach((scene) => {
      reset(scene);
      scene.removeAttribute("data-active");
    });
    bars.forEach((bar) => bar?.style.removeProperty("transform"));
  };
}

/** Narrow or short screens with motion: the scenes stack, and each plays its entrance once. */
function stack(track: HTMLElement): () => void {
  const scenes = [...track.querySelectorAll<HTMLElement>("[data-scene]")];
  const waiting = scenes.filter(
    (scene) => scene.getBoundingClientRect().top > window.innerHeight * 0.85,
  );
  waiting.forEach(prepare);
  const timelines: gsap.core.Timeline[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        timelines.push(enter(entry.target as HTMLElement));
      }
    },
    { rootMargin: "0px 0px -18% 0px" },
  );
  const cancelReady = onPageReady(() => waiting.forEach((scene) => observer.observe(scene)));
  return () => {
    cancelReady();
    observer.disconnect();
    timelines.forEach((timeline) => timeline.kill());
    scenes.forEach(reset);
  };
}

/**
 * Drives the Selected work stage. With motion on a wide screen the panel pins and the scenes
 * change inside it; elsewhere they stack and enter as they scroll in. Without motion (reduced
 * motion, or no scripting) the stacked scenes are simply there.
 */
export function WorkStageMotion({ count, children }: { count: number; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || document.documentElement.dataset.motion !== "on") return;
    const query = window.matchMedia(PINNED_QUERY);
    let teardown = () => {};
    const start = () => {
      teardown();
      teardown = query.matches ? pin(track, count) : stack(track);
    };
    start();
    const stopTravellers = startTravellers(track);
    query.addEventListener("change", start);
    return () => {
      query.removeEventListener("change", start);
      teardown();
      stopTravellers();
    };
  }, [count]);

  return (
    <div
      ref={trackRef}
      data-work-track
      className="relative"
      style={
        { "--work-steps": trackSteps(count), "--work-step": `${STEP * 100}svh` } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
