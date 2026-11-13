"use client";

import gsap from "gsap";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { TRACK, scatterOf, trackProgress } from "@/lib/focus-statement";

/**
 * Wraps the statement. With motion on, the section is a tall track holding one pinned screen, and
 * scrolling through it plays one paused timeline that brings each `[data-focus-word]` out of its
 * scatter (see lib/focus-statement) into the paragraph, with a short random stagger between
 * words; the timeline follows the scroll position one to one, so scrolling up reverses it.
 * Without motion (reduced motion, no script) the track is not tall and the words simply sit in
 * the paragraph.
 */
export function FocusStatementMotion({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = track.current;
    if (!host || document.documentElement.dataset.motion !== "on") return;
    const words = [...host.querySelectorAll<HTMLElement>("[data-focus-word]")];
    const action = host.querySelector<HTMLElement>("[data-focus-action]");

    const timeline = gsap.timeline({ paused: true }).fromTo(
      words,
      {
        opacity: 0,
        z: (index: number) => scatterOf(index).z,
        xPercent: (index: number) => scatterOf(index).xPercent,
        yPercent: (index: number) => scatterOf(index).yPercent,
        rotationX: (index: number) => scatterOf(index).rotationX,
      },
      {
        opacity: 1,
        z: 0,
        xPercent: 0,
        yPercent: 0,
        rotationX: 0,
        ease: "expo",
        stagger: { each: 0.006, from: "random" },
      },
    );
    // The button follows the last word, on the same scroll, so it also leaves when scrolling up.
    if (action)
      timeline.fromTo(
        action,
        { opacity: 0, yPercent: 40 },
        { opacity: 1, yPercent: 0, duration: 0.35, ease: "power2.out" },
      );

    const follow = () => {
      timeline.progress(
        trackProgress(host.getBoundingClientRect().top, host.offsetHeight, window.innerHeight),
      );
    };

    host.setAttribute("data-live", "");
    follow();
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
      timeline.kill();
      host.removeAttribute("data-live");
      gsap.set(words, { clearProps: "all" });
      if (action) gsap.set(action, { clearProps: "all" });
    };
  }, []);

  return (
    <div ref={track} data-focus-statement style={{ "--focus-track": TRACK } as CSSProperties}>
      <div data-focus-screen>{children}</div>
    </div>
  );
}
