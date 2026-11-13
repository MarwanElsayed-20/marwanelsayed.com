"use client";

import { useEffect, useRef, useState } from "react";
import { readColorToken } from "@/lib/css-token";
import { FluidSmoke } from "@/lib/fluid-smoke";

type CursorState = "default" | "link" | "hidden";

const INTERACTIVE =
  'a[href], button:not(:disabled), summary, [role="button"], label[for], [data-cursor="link"]';
const NATIVE = 'input, textarea, select, [contenteditable="true"], [data-cursor="hide"]';

/** The smoke keeps simulating this long after the pointer last moved, so it can drift away. */
const SETTLE_MS = 2600;
/** Strength of a puff of ink: how much of the screen colour it covers at its centre. */
const INK_STRENGTH = 0.3;

/** Reads any CSS colour as 0..1 channels, through a 1px canvas. */
function toRgb(color: string): [number, number, number] {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const context = probe.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function stateFor(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return "default";
  if (target.closest(NATIVE)) return "hidden";
  if (target.closest(INTERACTIVE)) return "link";
  return "default";
}

/**
 * An ink cursor: moving the pointer stirs a fluid and leaves ink in it, so the ink curls into
 * long, fading wisps. The system pointer stays visible, so nothing is lost for precision. Over
 * links the ink pauses (the control itself reacts instead). It exists only for a fine, hovering
 * pointer and never with reduced motion; touch and keyboard users are untouched. Drawing stops
 * when the pointer is still.
 */
export function Cursor() {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Forced colours replace every author colour, so an ink cursor would only be noise.
    const forced = window.matchMedia("(forced-colors: active)");
    const update = () => setActive(fine.matches && !reduced.matches && !forced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    forced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
      forced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-cursor-canvas]")!;
    const smoke = FluidSmoke.create(canvas);

    const tones = {
      light: toRgb(readColorToken("--color-foreground")),
      dark: toRgb(readColorToken("--color-background")),
    };
    let ink = tones.light;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let seen = false;
    let frame: number | undefined;
    let last = 0;
    let state: CursorState = "default";
    let smokeUntil = 0;
    let lost = false;

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const darkAt = (x: number, y: number, node: EventTarget | null) => {
      if (node instanceof Element && node.closest('[data-surface="dark"]')) return true;
      // The hero panel lets pointer events through, so test its box directly.
      const rect = document.querySelector("[data-hero-stage]")?.getBoundingClientRect();
      return !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    const draw = (now: number) => {
      frame = undefined;
      const delta = Math.min((now - (last || now)) / 1000, 0.033);
      last = now;
      const before = { x: pos.x, y: pos.y };
      // Ease toward the pointer: the lag is what makes the ink feel liquid.
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      const dx = pos.x - before.x;
      const dy = pos.y - before.y;
      const speed = Math.hypot(dx, dy);

      const smoking = state === "default";
      if (smoke && !lost && smoking && speed > 0.3) {
        // Stir the fluid along the path travelled and leave ink in it.
        const steps = Math.max(1, Math.round(speed / 9));
        for (let step = 1; step <= steps; step += 1) {
          const t = step / steps;
          const x = before.x + dx * t;
          const y = before.y + dy * t;
          smoke.splat(
            x / window.innerWidth,
            1 - y / window.innerHeight,
            (dx / window.innerWidth) * 1.2,
            (-dy / window.innerHeight) * 1.2,
            [ink[0] * INK_STRENGTH, ink[1] * INK_STRENGTH, ink[2] * INK_STRENGTH, INK_STRENGTH],
          );
        }
        smokeUntil = now + SETTLE_MS;
      }
      if (smoke && !lost && now < smokeUntil) {
        smoke.step(delta || 0.016);
        smoke.render();
      } else if (smoke && !lost && smokeUntil !== 0) {
        smoke.clear();
        smokeUntil = 0;
      }

      // Keep going while anything is still moving; otherwise stop and wait for the next move.
      if (speed > 0.15 || now < smokeUntil || Math.hypot(target.x - pos.x, target.y - pos.y) > 0.5)
        frame = requestAnimationFrame(draw);
      else last = 0;
    };
    const wake = () => {
      if (frame === undefined) frame = requestAnimationFrame(draw);
    };

    const resize = () => smoke?.resize();

    const show = (visible: boolean) => {
      root.dataset.cursorVisible = String(visible);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      target.x = event.clientX;
      target.y = event.clientY;
      // Ink is dark on paper and light over the dark panel, which lets pointer events through.
      const dark = darkAt(target.x, target.y, event.target);
      ink = dark ? tones.dark : tones.light;
      root.dataset.cursorTone = dark ? "dark" : "light";
      if (!seen) {
        // First movement: appear where the pointer is instead of sweeping in from 0,0.
        pos.x = target.x;
        pos.y = target.y;
        seen = true;
        show(true);
      }
      wake();
    };
    const onOver = (event: PointerEvent) => {
      state = stateFor(event.target);
      root.dataset.cursorState = state;
      // Ink is dark on paper and light on the dark sections.
      const dark = darkAt(event.clientX, event.clientY, event.target);
      ink = dark ? tones.dark : tones.light;
      root.dataset.cursorTone = dark ? "dark" : "light";
      wake();
    };
    const onLeave = () => show(false);
    const onEnter = () => seen && show(true);

    const html = document.documentElement;
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    html.addEventListener("pointerenter", onEnter);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", onLost);
      smoke?.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.removeEventListener("pointerleave", onLeave);
      html.removeEventListener("pointerenter", onEnter);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-cursor-root
      data-cursor-state="default"
      data-cursor-visible="false"
    >
      <canvas data-cursor-canvas />
    </div>
  );
}
