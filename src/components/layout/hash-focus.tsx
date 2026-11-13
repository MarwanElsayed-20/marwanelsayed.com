"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SCROLL_DURATION_MS = 450;

/**
 * An element's top in the document. While a page transition brings in the new page, the page shell
 * wears a scale and an offset that `getBoundingClientRect` includes, so the position is read from
 * layout alone (whole pixels) instead; measured the other way, the page would settle a screen or
 * more away from its target when the shell reaches full size.
 */
function documentTop(element: HTMLElement): number {
  if (document.documentElement.dataset.pageTransition !== "true")
    return element.getBoundingClientRect().top + window.scrollY;
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null)
    top += node.offsetTop;
  return top;
}

/** Where the window scrolls to so that `target` sits at its scroll margin. */
function scrollEnd(target: HTMLElement, id: string): number {
  if (!id) return 0;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return Math.max(
    0,
    Math.min(
      documentTop(target) - margin,
      document.documentElement.scrollHeight - window.innerHeight,
    ),
  );
}

/** Focus native hash targets and keep long-page navigation within the one-second budget. */
export function HashFocus() {
  const pathname = usePathname();
  useEffect(() => {
    let scrollFrame: number | undefined;
    // A scroll made while a page transition played is checked again when it ends.
    let transitionObserver: MutationObserver | undefined;
    const cancelScroll = () => {
      if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
      scrollFrame = undefined;
      transitionObserver?.disconnect();
      transitionObserver = undefined;
    };
    const correctWhenTransitionEnds = (target: HTMLElement, id: string) => {
      const root = document.documentElement;
      if (root.dataset.pageTransition !== "true") return;
      transitionObserver = new MutationObserver(() => {
        if (root.dataset.pageTransition === "true") return;
        transitionObserver?.disconnect();
        transitionObserver = undefined;
        const end = scrollEnd(target, id);
        if (Math.abs(window.scrollY - end) > 0.5)
          window.scrollTo({ top: end, behavior: "instant" });
      });
      transitionObserver.observe(root, {
        attributes: true,
        attributeFilter: ["data-page-transition"],
      });
    };
    // The open menu makes the page inert, so wait for it to close before focusing and scrolling.
    let menuObserver: MutationObserver | undefined;
    const whenMenuClosed = (run: () => void) => {
      menuObserver?.disconnect();
      menuObserver = undefined;
      const root = document.documentElement;
      if (!root.dataset.menuOpen) {
        run();
        return;
      }
      menuObserver = new MutationObserver(() => {
        if (root.dataset.menuOpen) return;
        menuObserver?.disconnect();
        menuObserver = undefined;
        run();
      });
      menuObserver.observe(root, { attributes: true, attributeFilter: ["data-menu-open"] });
    };
    const focusDestination = (hash: string, animate: boolean) =>
      whenMenuClosed(() => moveToDestination(hash, animate));
    const moveToDestination = (hash: string, animate: boolean) => {
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      if (id === "websites-ecommerce" || id === "saas-dashboards") {
        const filter = id;
        id = "work";
        const work = document.getElementById(id);
        if (work) work.dataset.workFilter = filter;
        window.history.replaceState(null, "", `${location.pathname}${location.search}#work`);
        window.dispatchEvent(new CustomEvent("work-filter", { detail: filter }));
      }
      const target = document.getElementById(id || "main");
      if (!target) return;
      cancelScroll();
      target.focus({ preventScroll: true });
      const end = scrollEnd(target, id);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (!animate || reducedMotion.matches) {
        window.scrollTo({ top: end, behavior: "instant" });
        correctWhenTransitionEnds(target, id);
        return;
      }
      const start = window.scrollY;
      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = reducedMotion.matches
          ? 1
          : Math.min(1, (now - startedAt) / SCROLL_DURATION_MS);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo({ top: start + (end - start) * eased, behavior: "instant" });
        scrollFrame = progress < 1 ? requestAnimationFrame(step) : undefined;
      };
      scrollFrame = requestAnimationFrame(step);
    };
    const focusCurrentHash = () => {
      if (window.location.hash) focusDestination(window.location.hash, false);
    };
    const initialFrame = requestAnimationFrame(focusCurrentHash);
    window.addEventListener("hashchange", focusCurrentHash);
    // Next Link updates history without hashchange. Handle same-document activation before it.
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const target = new URL(link.href, location.href);
      if (
        target.origin !== location.origin ||
        target.pathname !== location.pathname ||
        target.search !== location.search
      )
        return;
      try {
        const id = decodeURIComponent(target.hash.slice(1));
        if (
          target.hash &&
          !document.getElementById(id) &&
          id !== "websites-ecommerce" &&
          id !== "saas-dashboards"
        )
          return;
      } catch {
        return;
      }
      event.preventDefault();
      if (target.href !== location.href) window.history.pushState(null, "", target.href);
      focusDestination(target.hash, true);
    };
    document.addEventListener("click", onClick, true);
    // User input can interrupt the animation instead of fighting it.
    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    window.addEventListener("keydown", cancelScroll);
    return () => {
      cancelAnimationFrame(initialFrame);
      menuObserver?.disconnect();
      cancelScroll();
      window.removeEventListener("hashchange", focusCurrentHash);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
      window.removeEventListener("keydown", cancelScroll);
    };
  }, [pathname]);
  return null;
}
