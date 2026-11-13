"use client";

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";
import { CARD_SCALE, cardGeometry, cardSlot, growClip, poseCard } from "@/lib/page-card";
import { announceArrival, pageState, setPageState } from "@/lib/page-ready";
import { lockScroll } from "@/lib/scroll-lock";
import { transitionTarget } from "@/lib/transition";

/** If the new route has not rendered by then, uncover the page anyway so it can never stick. */
const ROUTE_TIMEOUT_MS = 5000;

type Waiter = { pathname: string; resolve: () => void };

const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(count);
  });

/** The "Loading" card is on screen for at least this long, so it can be read. */
const MIN_CARD_MS = 700;

const SHELL_PROPS = "transform,transformOrigin,clipPath,opacity";

/**
 * Page transitions for App Router navigation. The page (or the page card the menu holds) settles
 * in the middle as a rounded card over a dark backdrop and slides out to the left while a paper
 * card that says "Loading" slides in from the right. The route changes while that card is up. Then
 * it slides away to the left, the new page comes in from the right as a card and grows to fill the
 * screen. Only the page shell and a few fixed layers move, so it stays smooth on long pages.
 * Back/forward and anything the browser should handle (new tabs, modified clicks, other origins,
 * same-page hashes) stay native.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const waiter = useRef<Waiter | null>(null);
  const previousPath = useRef(pathname);

  // The route has changed: settle whoever is waiting, or soften an unmanaged (back/forward) change.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (waiter.current) {
      waiter.current.resolve();
      waiter.current = null;
      return;
    }
    if (prefersReducedMotion()) return;
    const main = document.querySelector("main");
    if (main)
      gsap.fromTo(
        main,
        { opacity: 0 },
        { opacity: 1, duration: duration.base, ease: ease.soft, clearProps: "opacity" },
      );
  }, [pathname]);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;
    const shell = () => document.querySelector<HTMLElement>("[data-page-shell]");
    const card = () => curtain.querySelector<HTMLElement>("[data-curtain-card]");
    let releaseScroll: (() => void) | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    /** The arrived page growing to fill the screen; it plays on after the route has changed. */
    let growing: gsap.core.Timeline | null = null;

    /** Puts everything back as it is when no transition runs. */
    const settle = () => {
      const page = shell();
      const label = card();
      gsap.killTweensOf([curtain, page, label]);
      gsap.set(curtain, { visibility: "hidden", clearProps: "opacity" });
      if (label) gsap.set(label, { clearProps: "transform,visibility" });
      if (page) gsap.set(page, { clearProps: SHELL_PROPS });
      page?.querySelector<HTMLElement>("[data-page-dim]")?.style.removeProperty("opacity");
      delete document.documentElement.dataset.pageTransition;
      announceArrival();
    };

    const arrive = (target: string) =>
      new Promise<void>((resolve) => {
        waiter.current = { pathname: target, resolve };
        timeout = setTimeout(() => {
          waiter.current = null;
          resolve();
        }, ROUTE_TIMEOUT_MS);
      }).finally(() => clearTimeout(timeout));

    // A tween that is cut short still lets the change go on, so a navigation can never hang.
    const run = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
      new Promise<void>((resolve) => {
        gsap.to(target, { ...vars, onComplete: resolve, onInterrupt: resolve });
      });
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const navigate = async (url: URL) => {
      busy.current = true;
      const html = document.documentElement;
      const menuOpen = html.dataset.menuOpen === "true";
      const page = shell();
      const label = card();
      // A click while the last page is still growing in: stop that for good, so its tidy-up
      // cannot run later and undo this change part-way.
      growing?.kill();
      growing = null;
      setPageState("entering");
      let opening = false;
      try {
        let heldAt = 0;
        if (page && label) {
          // A transition from an earlier click may still be settling: start from a plain page.
          if (!menuOpen) {
            gsap.killTweensOf([curtain, page, label]);
            gsap.set(page, { clearProps: SHELL_PROPS });
          }
          html.dataset.pageTransition = "true";
          releaseScroll = lockScroll();
          gsap.set(label, { x: window.innerWidth, visibility: "visible" });
          gsap.set(curtain, { visibility: "visible" });
          if (menuOpen) {
            // The page card the menu holds un-dims and moves to the middle; the list fades.
            gsap.set(curtain, { opacity: 1 });
            const menu = document.querySelector<HTMLElement>("[data-menu-root]");
            if (menu) gsap.to(menu, { opacity: 0, duration: duration.base, ease: "none" });
            const dim = page.querySelector<HTMLElement>("[data-page-dim]");
            if (dim) gsap.to(dim, { opacity: 0, duration: 0.6, ease: ease.inOut });
            await run(page, { x: cardSlot("centre"), duration: 0.6, ease: ease.inOut });
          } else {
            const geometry = cardGeometry(page, 0);
            gsap.set(curtain, { opacity: 0 });
            gsap.set(page, { transformOrigin: geometry.origin, clipPath: geometry.flat });
            gsap.to(curtain, { opacity: 1, duration: duration.base, ease: "none" });
            await run(page, {
              scale: CARD_SCALE,
              clipPath: geometry.card,
              x: cardSlot("centre"),
              duration: 0.6,
              ease: ease.inOut,
            });
          }
          // The old page leaves to the left as the "Loading" card arrives from the right.
          gsap.to(page, { x: cardSlot("left"), duration: 0.7, ease: ease.inOut });
          await run(label, { x: 0, duration: 0.7, ease: ease.inOut });
          heldAt = performance.now();
        }
        const arrived = arrive(url.pathname);
        router.push(`${url.pathname}${url.search}${url.hash}`);
        await arrived;
        // Let the new page lay out and paint while it is out of sight, and let the card be read.
        await frames(2);
        if (page && label) setPageState("ready");
        await wait(Math.max(0, MIN_CARD_MS - (performance.now() - heldAt)));
        if (!url.hash) window.scrollTo({ top: 0, behavior: "instant" });
        if (page && label) {
          // The new page waits as a card at the right, slides in as the label leaves, then grows
          // to fill the screen. The page is usable straight away: this plays out in the
          // background and never blocks the next click.
          const into = poseCard(page, "right");
          const clip = growClip(page, () => into);
          opening = true;
          growing = gsap
            .timeline({
              onComplete: () => {
                growing = null;
                settle();
              },
            })
            .to(label, { x: cardSlot("left"), duration: 0.7, ease: ease.inOut }, 0)
            .to(page, { x: cardSlot("centre"), duration: 0.7, ease: ease.inOut }, 0)
            .to(page, { scale: 1, x: 0, duration: 0.8, ease: ease.inOut }, ">0.1")
            // The corners stay round until the page fills the screen, then they slip off its edges.
            .to(clip.target, { ...clip.vars, duration: 0.45, ease: "power2.inOut" }, ">")
            .to(curtain, { opacity: 0, duration: duration.base, ease: "none" }, "<0.15");
        }
      } finally {
        if (!opening) settle();
        releaseScroll?.();
        releaseScroll = null;
        busy.current = false;
        if (pageState() === "entering") setPageState("ready");
      }
    };

    const onClick = (event: MouseEvent) => {
      if (prefersReducedMotion() || document.documentElement.dataset.loader === "active") return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const url = transitionTarget(
        event,
        link instanceof HTMLAnchorElement ? link : null,
        window.location,
      );
      if (!url) return;
      event.preventDefault();
      if (busy.current) return;
      void navigate(url);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timeout);
      growing?.kill();
      releaseScroll?.();
      const page = shell();
      const label = card();
      gsap.killTweensOf([curtain, page, label]);
      gsap.set(curtain, { clearProps: "all" });
      if (label) gsap.set(label, { clearProps: "transform,visibility" });
      if (page) gsap.set(page, { clearProps: SHELL_PROPS });
      delete document.documentElement.dataset.pageTransition;
    };
  }, [router]);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      data-curtain
      className="pointer-events-none invisible fixed inset-0 z-0 overflow-hidden bg-foreground"
    >
      <div data-silk />
      <div
        data-curtain-card
        className="absolute inset-[5%] flex items-center justify-center rounded-[25px] bg-background text-[clamp(1.75rem,4.3vw,6rem)] leading-[1.1] tracking-tight text-foreground"
      >
        Loading
      </div>
    </div>
  );
}
