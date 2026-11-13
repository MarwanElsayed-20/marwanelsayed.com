"use client";

import { useEffect, useRef } from "react";
import { contactLogos, logoSvg, tileTone } from "@/components/site/contact-logo-markup";
import { isGone, launch, poke, step, type Flight } from "@/lib/contact-flight";

/** Where the still logos sit (percent of the band) when nothing flies: reduced motion or no scripts. */
const STILL: readonly { left: number; top: number; size: number }[] = [
  { left: 7, top: 62, size: 1 },
  { left: 16, top: 24, size: 0.8 },
  { left: 27, top: 78, size: 0.9 },
  { left: 44, top: 86, size: 1 },
  { left: 61, top: 80, size: 0.85 },
  { left: 74, top: 20, size: 0.9 },
  { left: 84, top: 66, size: 1 },
  { left: 93, top: 34, size: 0.8 },
];

const MAX_LIVE = 18;

const tile = (html: string, tone: "light" | "dark") => {
  const element = document.createElement("div");
  element.setAttribute("data-contact-logo", "");
  element.setAttribute("data-tone-tile", tone);
  element.innerHTML = html;
  return element;
};

const place = (element: HTMLElement, flight: Flight) => {
  const half = flight.size / 2;
  element.style.transform = `translate3d(${(flight.x - half).toFixed(1)}px, ${(flight.y - half).toFixed(1)}px, 0) rotate(${(-flight.angle).toFixed(3)}rad)`;
};

/**
 * The decoration behind and over the contact invitation. Without motion it is a few still logos.
 * With motion, logos are launched from below every few seconds (1 to 6 at a time, fewer on a
 * phone), arc up and fall out of sight; hovering one gives it a push. Nothing runs while the band
 * is off screen or the tab is hidden, and only logos still in sight are kept.
 */
export function ContactLogos() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = layer.current;
    const section = root?.parentElement;
    if (!root || !section || document.documentElement.dataset.motion !== "on") return;

    const live: { flight: Flight; element: HTMLElement }[] = [];
    let width = root.clientWidth;
    let height = root.clientHeight;
    let visible = false;
    let frame = 0;
    let last = 0;
    let untilNext = 0.3;
    let removed = false;

    const small = () => width < 768;
    const sizeFor = () => Math.min(120, Math.max(56, width * 0.065)) * (0.85 + Math.random() * 0.3);

    const spawn = () => {
      const count = 1 + Math.floor(Math.random() * (small() ? 3 : 6));
      for (let i = 0; i < count && live.length < MAX_LIVE; i++) {
        const logo = contactLogos[Math.floor(Math.random() * contactLogos.length)];
        const size = sizeFor();
        const element = tile(logoSvg(logo), tileTone(logo));
        element.style.width = element.style.height = `${size}px`;
        const flight = launch(width, height, size);
        element.addEventListener("pointerenter", () => poke(flight, height), { once: true });
        place(element, flight);
        root.appendChild(element);
        live.push({ flight, element });
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (removed || !visible || document.hidden) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
      last = now;
      untilNext -= dt;
      if (untilNext <= 0) {
        spawn();
        untilNext = small() ? 5 : 3;
      }
      for (let i = live.length - 1; i >= 0; i--) {
        const { flight, element } = live[i];
        step(flight, dt, height);
        if (isGone(flight, height)) {
          element.remove();
          live.splice(i, 1);
        } else place(element, flight);
      }
      frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!frame && visible && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const watcher = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) run();
      },
      { threshold: 0.15 },
    );
    watcher.observe(section);
    const sizing = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
    });
    sizing.observe(root);
    const onVisibility = () => run();
    document.addEventListener("visibilitychange", onVisibility);
    root.setAttribute("data-live", "");

    return () => {
      removed = true;
      cancelAnimationFrame(frame);
      watcher.disconnect();
      sizing.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      live.forEach(({ element }) => element.remove());
      root.removeAttribute("data-live");
    };
  }, []);

  return (
    <div
      ref={layer}
      aria-hidden="true"
      data-contact-logos
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {STILL.map((spot, index) => {
        const logo = contactLogos[index % contactLogos.length];
        return (
          <div
            key={logo.title}
            data-contact-logo
            data-contact-still
            data-tone-tile={tileTone(logo)}
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `calc(var(--contact-logo, 5rem) * ${spot.size})`,
              height: `calc(var(--contact-logo, 5rem) * ${spot.size})`,
            }}
            dangerouslySetInnerHTML={{ __html: logoSvg(logo) }}
          />
        );
      })}
    </div>
  );
}
