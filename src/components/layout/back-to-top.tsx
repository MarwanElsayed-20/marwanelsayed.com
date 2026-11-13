"use client";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Returns to the top of the page: a round button with an arrow. On hover a lime circle grows out
 * of the pointer and fills it. Smooth unless the visitor prefers reduced motion.
 */
export function BackToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Back to top"
      data-back-to-top
      className={className}
      onPointerEnter={(event) => follow(event)}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "instant" : "smooth" })
      }
    >
      <span data-back-ball aria-hidden="true" />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="relative z-10 size-[40%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

/** The fill grows from wherever the pointer entered, so it is placed there first. */
function follow(event: React.PointerEvent<HTMLButtonElement>) {
  const button = event.currentTarget;
  const box = button.getBoundingClientRect();
  button.style.setProperty("--ball-x", `${event.clientX - box.left}px`);
  button.style.setProperty("--ball-y", `${event.clientY - box.top}px`);
}
