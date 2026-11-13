"use client";

import gsap from "gsap";
import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { smoothScroll } from "@/lib/smooth-scroll";

/**
 * Eases mouse-wheel scrolling so the page glides instead of stepping. The page still scrolls
 * natively (scroll position, anchors, keyboard and touch are untouched); Lenis only adds the
 * easing to wheel input, and runs on the same GSAP ticker as every other animation. It stays off
 * with reduced motion, and while an overlay locks the page.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || document.documentElement.dataset.motion !== "on") return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: false });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    smoothScroll.set(lenis);
    return () => {
      gsap.ticker.remove(tick);
      smoothScroll.set(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
