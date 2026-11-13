"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { duration, ease } from "@/lib/motion";
import {
  LOADER_MAX_MS,
  LOADER_MIN_MS,
  LOADER_STORAGE_KEY,
  progressTarget,
  remainingHold,
} from "@/lib/loader";
import { cardSlot, growClip, poseCard } from "@/lib/page-card";
import { announceArrival, setPageState } from "@/lib/page-ready";
import { lockScroll } from "@/lib/scroll-lock";

/**
 * The opening sequence: the name on paper with a counter that follows real milestones (hydration,
 * fonts, first-screen images), then a second line while a dark frame closes in around the panel,
 * then the panel turns clear so the page shows through and opens out to fill the screen.
 * Markup is server-rendered but hidden by CSS unless the boot script in <head> activated it, so
 * visitors without scripting, with reduced motion, or already past the intro never see it.
 */
const CARD_RADIUS = 25;
const SETTLE = { clearProps: "transform,transformOrigin,clipPath,opacity" };

export function Loader({ name, phrase }: { name: string; phrase: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || html.dataset.loader !== "active") return;

    const startedAt = performance.now();
    const release = lockScroll();
    const behind = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer"));
    behind.forEach((element) => element.setAttribute("inert", ""));

    const panel = root.querySelector<HTMLElement>("[data-loader-panel]");
    const first = root.querySelectorAll("[data-loader-first]");
    const second = root.querySelectorAll("[data-loader-second]");
    gsap.set(second, { yPercent: 110 });
    gsap.set(root.querySelector("[data-loader-secondwrap]"), { visibility: "visible" });
    const countElement = root.querySelector<HTMLElement>("[data-loader-count]");
    const counter = { value: 0 };
    const render = () => {
      if (countElement) countElement.textContent = String(Math.round(counter.value));
    };
    const steps = { hydrated: true, fonts: false, images: false };
    let finished = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let exit: gsap.core.Timeline | undefined;

    const countTo = (value: number, seconds: number) =>
      gsap.to(counter, {
        value,
        duration: seconds,
        ease: "power2.out",
        overwrite: true,
        onUpdate: render,
      });
    // The number climbs steadily over the minimum hold, but never past what has really happened.
    const pace = () => {
      if (finished) return;
      const progress = Math.min(1, (performance.now() - startedAt) / LOADER_MIN_MS);
      const paced = 99 * (1 - (1 - progress) * (1 - progress));
      const target = progressTarget(steps);
      const limit = target >= 100 ? 99 : target;
      counter.value += (Math.min(paced, limit) - counter.value) * 0.18;
      render();
    };
    gsap.ticker.add(pace);

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(holdTimer);
      gsap.ticker.remove(pace);
      countTo(100, 0.4);
      const page =
        document.querySelector<HTMLElement>("[data-page-shell]") ?? document.createElement("div");
      const curtain =
        document.querySelector<HTMLElement>("[data-curtain]") ?? document.createElement("div");
      const wide = window.innerWidth;
      const tall = window.innerHeight;
      let look = { top: 0, bottom: 0 };
      const clip = growClip(page, () => look);
      exit = gsap
        .timeline({
          delay: 0.35,
          onComplete: () => {
            html.dataset.loader = "done";
            try {
              sessionStorage.setItem(LOADER_STORAGE_KEY, "1");
            } catch {
              // Storage is optional; without it the intro simply plays again next time.
            }
            teardown();
            announceArrival();
          },
        })
        .to(first, { yPercent: -110, duration: duration.base, ease: "power3.in", stagger: 0.05 })
        .fromTo(
          second,
          { yPercent: 110 },
          { yPercent: 0, duration: duration.long, ease: ease.out },
          "-=0.2",
        )
        // The paper shrinks into a rounded card over the dark backdrop, with the page waiting
        // to the right as a card of its own.
        .add(() => {
          gsap.set(curtain, { visibility: "visible", opacity: 0 });
          gsap.to(curtain, { opacity: 1, duration: duration.base, ease: "none" });
          look = poseCard(page, "right");
        }, "<0.1")
        .to(
          panel,
          {
            top: tall * 0.05,
            right: wide * 0.05,
            bottom: tall * 0.05,
            left: wide * 0.05,
            borderRadius: CARD_RADIUS,
            duration: duration.long,
            ease: ease.inOut,
          },
          "<0.1",
        )
        // The page finishes its own entrance while it waits, so it is complete when it arrives.
        .add(() => setPageState("ready"), "<0.2")
        .to(panel, { x: -wide, duration: 0.8, ease: ease.inOut }, "+=1.1")
        .to(page, { x: () => cardSlot("centre"), duration: 0.8, ease: ease.inOut }, "<")
        .to(page, { scale: 1, x: 0, duration: 0.9, ease: ease.inOut }, ">0.1")
        // The corners stay round until the page fills the screen, then they slip off its edges.
        .to(clip.target, { ...clip.vars, duration: 0.45, ease: "power2.inOut" }, ">")
        .to(curtain, { opacity: 0, duration: duration.base, ease: "none" }, "<0.15")
        .set(panel, { visibility: "hidden" })
        .add(() => {
          gsap.set(page, SETTLE);
          gsap.set(curtain, { visibility: "hidden", clearProps: "opacity" });
        });
    };

    const teardown = () => {
      behind.forEach((element) => element.removeAttribute("inert"));
      release();
    };

    const update = () => {
      const target = progressTarget(steps);
      if (target === 100) {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(finish, remainingHold(performance.now() - startedAt, steps));
      }
    };

    update();
    const maxTimer = setTimeout(finish, LOADER_MAX_MS);
    // A font failure must not hold the intro: `ready` settles either way.
    void document.fonts.ready.then(() => {
      steps.fonts = true;
      if (!finished) update();
    });
    // The hero scene belongs to the first screen: wait until it has drawn (or settled on its still
    // fallback) so the page arrives complete. It never waits longer than a few seconds.
    const heroSettled = () =>
      new Promise<void>((resolve) => {
        const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
        if (!stage) return resolve();
        const done = () =>
          stage.dataset.heroState === "ready" ||
          (stage.dataset.heroState === "fallback" && stage.dataset.heroReason !== "");
        if (done()) return resolve();
        const watcher = new MutationObserver(() => {
          if (!done()) return;
          watcher.disconnect();
          resolve();
        });
        watcher.observe(stage, { attributes: true });
        setTimeout(() => {
          watcher.disconnect();
          resolve();
        }, 4500);
      });
    // Only what the first screen needs: images below the fold must not hold the intro.
    const viewportImages = Array.from(document.images).filter((image) => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
    });
    void Promise.all(
      viewportImages.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) return resolve();
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    )
      .then(() => heroSettled())
      .then(() => {
        steps.images = true;
        if (!finished) update();
      });

    return () => {
      clearTimeout(maxTimer);
      clearTimeout(holdTimer);
      gsap.ticker.remove(pace);
      gsap.killTweensOf([counter, root, panel, first, second]);
      exit?.kill();
      teardown();
      if (!finished) gsap.set(panel, { clearProps: "all" });
    };
  }, []);

  return (
    <div ref={rootRef} data-loader-root>
      <div data-loader-panel data-grain>
        <span className="sr-only" role="status">
          Loading {name}
        </span>
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center px-gutter text-center"
        >
          <span className="block overflow-hidden pb-[0.15em]">
            <span
              data-loader-first
              className="block text-[clamp(1.75rem,4.3vw,6rem)] leading-[1.1] font-normal tracking-tight"
            >
              {name}
            </span>
          </span>
          <span
            data-loader-secondwrap
            className="invisible absolute block overflow-hidden pb-[0.15em]"
          >
            <span
              data-loader-second
              className="block text-[clamp(1.75rem,4.3vw,6rem)] leading-[1.1] font-normal tracking-tight"
            >
              {phrase}
            </span>
          </span>
        </div>
        <div
          aria-hidden="true"
          className="absolute right-gutter bottom-6 block overflow-hidden pb-[0.05em]"
        >
          <span
            data-loader-first
            className="flex items-baseline text-[clamp(4rem,9vw,7.5rem)] leading-none font-normal tracking-tight tabular-nums"
          >
            <span data-loader-count>0</span>
            <span>%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
