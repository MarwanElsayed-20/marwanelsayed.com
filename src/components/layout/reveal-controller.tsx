"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { duration, ease } from "@/lib/motion";
import { onPageArrived, onPageReady } from "@/lib/page-ready";

const SELECTOR = "[data-reveal]:not([data-revealed])";

/** The longest an entrance may wait: a reveal that starts late is a reveal that gets scrolled past. */
const MAX_DELAY = 0.25;

function delayOf(element: Element): number {
  const value = Number(element.getAttribute("data-reveal-delay"));
  return Number.isFinite(value) ? Math.min(MAX_DELAY, value * 0.6) : 0;
}

/** Big pieces (a framed panel or print) start once well up the screen; text starts as it enters. */
const isPanel = (kind: string | null) => kind === "clip" || kind === "print" || kind === "open";

/** On a phone a case study drops its world animations and keeps only the rise. */
const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;

/** A polygon as small as a point at its centre, with as many corners as the one it opens into. */
function collapsed(polygon: string): string {
  const corners = polygon.split(",").length;
  return `polygon(${Array.from({ length: corners }, () => "50% 50%").join(", ")})`;
}

/**
 * Plays entrance motion for `[data-reveal]` targets: "fade" (rise and appear), "mask" (a child
 * slides up inside its clipped parent, used per word) and "clip" (a panel opens from the top while
 * its `[data-reveal-inner]` settles from a slight zoom), "print", "rule", "ledger" and "row" (a panel or tile
 * that wipes in, a list whose rule draws, and a row that slides in), which CSS times once they are
 * marked revealed. The case study adds "scene" (a section rises 46px, 0.86s, as it crosses 86% of
 * the screen), "open" (the hero capture opens from its centre into the polygon in `--open-clip`)
 * and "stagger" (its children rise one after another), with the
 * second and third left out on a phone. Targets wait for the loader or page
 * transition to finish, then reveal as they enter the viewport. CSS hides targets before paint
 * only when `html[data-motion="on"]`, and marking `data-revealed` hands control to GSAP with no
 * flash because the tween's start state is applied in the same task.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    if (document.documentElement.dataset.motion !== "on") return;
    // From here the controller owns every reveal: the CSS last resort (globals.css) stands down.
    document.documentElement.setAttribute("data-reveal-ready", "");
    const observers: IntersectionObserver[] = [];
    let removeEndListeners: (() => void) | null = null;
    const tweens: gsap.core.Animation[] = [];

    // Targets marked `data-reveal-arrival` are meant to be watched, so they wait until the loader or
    // the "Loading" card has lifted instead of playing while it still covers the page.
    const waiting = new Map<Element, () => void>();
    const reveal = (element: Element): void => {
      if (element.hasAttribute("data-revealed")) return;
      if (element.hasAttribute("data-reveal-arrival")) {
        if (waiting.has(element)) return;
        waiting.set(
          element,
          onPageArrived(() => {
            waiting.delete(element);
            element.removeAttribute("data-reveal-arrival");
            reveal(element);
          }),
        );
        return;
      }
      const kind = element.getAttribute("data-reveal");
      const delay = delayOf(element);
      if (kind === "mask") {
        const inner = element.firstElementChild;
        if (inner)
          tweens.push(
            gsap.fromTo(
              inner,
              { yPercent: 115 },
              {
                yPercent: 0,
                duration: duration.base,
                ease: ease.out,
                delay,
                clearProps: "transform",
              },
            ),
          );
      } else if (kind === "clip") {
        tweens.push(
          gsap.fromTo(
            element,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.1,
              ease: ease.inOut,
              delay,
              clearProps: "clipPath",
            },
          ),
        );
        const inner = element.querySelector("[data-reveal-inner]");
        if (inner)
          tweens.push(
            gsap.fromTo(inner, { scale: 1.12 }, { scale: 1, duration: 1.4, ease: ease.out, delay }),
          );
      } else if (kind === "print") {
        // Timed in CSS (globals.css, "print"): only the delay is passed on.
        if (element instanceof HTMLElement) element.style.setProperty("--print-delay", `${delay}s`);
      } else if (kind === "rule" || kind === "ledger") {
        // Timed in CSS (globals.css, "rule" and "ledger"): marking it revealed is all it needs.
      } else if (kind === "row") {
        // Timed in CSS too (globals.css, "row"): each row slides in as it comes into view.
      } else if (kind === "scene") {
        const narrow = isNarrow();
        tweens.push(
          gsap.fromTo(
            element,
            { opacity: 0, y: narrow ? 26 : 46 },
            {
              opacity: 1,
              y: 0,
              duration: narrow ? 0.66 : 0.86,
              ease: ease.scene,
              // Unlike the others its delay is fixed (0, 0.045 or 0.09s): not scaled.
              delay: Number(element.getAttribute("data-reveal-delay")) || 0,
              clearProps: "transform,opacity",
            },
          ),
        );
      } else if (kind === "open") {
        const final =
          element instanceof HTMLElement
            ? getComputedStyle(element).getPropertyValue("--open-clip").trim()
            : "";
        if (final && !isNarrow())
          tweens.push(
            gsap.fromTo(
              element,
              { clipPath: collapsed(final) },
              { clipPath: final, duration: 1.1, ease: ease.open, delay, clearProps: "clipPath" },
            ),
          );
      } else if (kind === "stagger") {
        if (!isNarrow())
          tweens.push(
            gsap.fromTo(
              Array.from(element.children),
              { opacity: 0, y: 42 },
              {
                opacity: 1,
                y: 0,
                duration: 0.72,
                ease: ease.scene,
                stagger: 0.11,
                clearProps: "transform,opacity",
              },
            ),
          );
      } else {
        tweens.push(
          gsap.fromTo(
            element,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: duration.base,
              ease: ease.out,
              delay,
              clearProps: "transform,opacity",
            },
          ),
        );
      }
      element.setAttribute("data-revealed", "");
    };

    const start = () => {
      // The footer is uncovered from underneath the page: it sits in the viewport from the start, so
      // its targets wait for the page end to rise off it, not for the first-screen check or the
      // observers (see below).
      const everything = Array.from(document.querySelectorAll(SELECTOR));
      const uncovered = everything.filter((target) => target.closest("[data-uncover]"));
      const all = everything.filter((target) => !target.closest("[data-uncover]"));
      // While the page waits beside the screen (as a card during a page change) it cannot
      // intersect the viewport, so what sits in the first screen by height reveals right away.
      // That holds on a reload that restores the scroll position too; everything below waits
      // until it has scrolled well into view.
      const reach = window.innerHeight * 0.94;
      const targets = all.filter((element) => {
        const top = element.getBoundingClientRect().top;
        if (top >= reach) return true;
        reveal(element);
        return false;
      });
      if (typeof IntersectionObserver === "undefined") {
        targets.forEach(reveal);
        uncovered.forEach(reveal);
        return;
      }
      const watchable = targets;
      // A target clipped away entirely by its own clip-path can report as not intersecting, so
      // clip and print targets are watched through their parent, which is always laid out normally.
      const watched = new Map<Element, { group: Element[]; observer: IntersectionObserver }>();
      const make = (rootMargin: string) => {
        const observer: IntersectionObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              observer.unobserve(entry.target);
              const found = watched.get(entry.target);
              watched.delete(entry.target);
              found?.group.forEach(reveal);
            }
          },
          { rootMargin, threshold: 0.01 },
        );
        observers.push(observer);
        return observer;
      };
      // Text starts just before it enters and is done within about half a
      // second; panels and prints start a third of the way up, where there is room to watch them.
      const textWatcher = make("0px 0px 8% 0px");
      const panelWatcher = make("0px 0px -36% 0px");
      // A case study's sections start as their top crosses 86% of the screen (92% on a phone) and
      // their staggered groups at 82%.
      const narrow = isNarrow();
      const sceneWatcher = make(`0px 0px -${narrow ? 8 : 14}% 0px`);
      const staggerWatcher = make(`0px 0px -${narrow ? 8 : 18}% 0px`);
      for (const target of watchable) {
        const kind = target.getAttribute("data-reveal");
        const panel = isPanel(kind);
        const watcher = panel ? (target.parentElement ?? target) : target;
        const observer =
          kind === "scene"
            ? sceneWatcher
            : kind === "stagger"
              ? staggerWatcher
              : panel
                ? panelWatcher
                : textWatcher;
        const found = watched.get(watcher);
        if (found) found.group.push(target);
        else watched.set(watcher, { group: [target], observer });
      }
      watched.forEach(({ observer }, watcher) => observer.observe(watcher));

      const footer = document.querySelector<HTMLElement>("[data-uncover]");
      const pending = new Set(uncovered);
      const onScroll = () => {
        const left = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
        // Its silk only moves while some of the footer is showing (see globals.css).
        if (footer) footer.toggleAttribute("data-uncovered", left < footer.offsetHeight);
        // At the very end of the page the last targets can never rise that far: reveal them there.
        if (left <= 2)
          watched.forEach(({ observer }, watcher) => {
            if (watcher.getBoundingClientRect().top >= window.innerHeight) return;
            observer.unobserve(watcher);
            watched.get(watcher)?.group.forEach(reveal);
            watched.delete(watcher);
          });
        // The footer starts once a fifth of it has been uncovered.
        if (pending.size > 0 && footer && left < footer.offsetHeight * 0.8) {
          pending.forEach(reveal);
          pending.clear();
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      removeEndListeners = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
      onScroll();
    };

    const cancelReady = onPageReady(start);
    return () => {
      cancelReady();
      waiting.forEach((cancel) => cancel());
      observers.forEach((observer) => observer.disconnect());
      removeEndListeners?.();
      tweens.forEach((tween) => tween.kill());
    };
  }, [pathname]);

  return null;
}
