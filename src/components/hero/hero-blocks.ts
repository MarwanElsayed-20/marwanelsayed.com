"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";
import { onPageReady } from "@/lib/page-ready";

const COLUMNS = 6;
const ROWS = 2;
const BEAT_SECONDS = 2.4;
/** Each row keeps at least this many blocks, so the panel never goes mostly empty. */
const MIN_VISIBLE = 2;
/** Above this many open blocks in a row, closing is favoured, so about half the panel stays empty. */
const COMFORTABLE = 3;
/** Slides and openings take this long. */
const MOVE_SECONDS = 0.95;

/** One block: where it sits (in columns, animated), how much of it is open, and its target column. */
type Block = { x: number; w: number; column: number; fromRight: boolean };

type HeroBlocksTargets = {
  /** The panel as laid out: its box is what pointer and clipping are measured against. */
  stage: RefObject<HTMLElement | null>;
  /** The dark surface that is clipped to the blocks; the gaps show the page behind it. */
  content: RefObject<HTMLElement | null>;
  /** The thin lines between neighbouring pieces: one element per block, row by row. */
  seams: RefObject<HTMLElement | null>;
  /** The row of "Scroll down" labels under the panel; it scrolls endlessly. */
  labels: RefObject<HTMLElement | null>;
};

type Corners = { tl: boolean; tr: boolean; br: boolean; bl: boolean };

/** A rectangle whose corners are rounded only where it meets the corner of the whole panel. */
function blockPath(x: number, y: number, w: number, h: number, r: number, round: Corners): string {
  const tl = round.tl ? r : 0;
  const tr = round.tr ? r : 0;
  const br = round.br ? r : 0;
  const bl = round.bl ? r : 0;
  const arc = (radius: number, toX: number, toY: number) =>
    radius > 0 ? `A${radius} ${radius} 0 0 1 ${toX} ${toY}` : "";
  return (
    `M${x + tl} ${y}H${x + w - tr}${arc(tr, x + w, y + tr)}V${y + h - br}` +
    `${arc(br, x + w - br, y + h)}H${x + bl}${arc(bl, x, y + h - bl)}V${y + tl}${arc(tl, x + tl, y)}Z`
  );
}

/**
 * The hero panel is a 6 by 2 grid of dark blocks on the page. Every couple of seconds a block
 * slides one place sideways into a free spot, closes, or opens from one edge, so the panel keeps
 * rearranging itself while the gaps show the page behind. Block corners are square except where
 * they meet a corner of the panel. While a fine pointer is over the panel everything stops and the
 * blocks close into one surface. Only when entrance motion is on (never for reduced motion or
 * without scripting); otherwise the panel is simply whole.
 */
export function useHeroBlocks({ stage, content, seams, labels }: HeroBlocksTargets) {
  useEffect(() => {
    const panel = stage.current;
    const surface = content.current;
    const seamEls = seams.current
      ? Array.from(seams.current.querySelectorAll<HTMLElement>("[data-hero-seam]"))
      : [];
    const labelRoot = labels.current;
    if (!panel || !surface) return;
    if (document.documentElement.dataset.motion !== "on" || prefersReducedMotion()) return;

    const rows: Block[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLUMNS }, (_, column) => ({
        x: column,
        w: 1,
        column,
        fromRight: false,
      })),
    );
    const all = rows.flat();
    const labelEls = labelRoot
      ? Array.from(labelRoot.querySelectorAll<HTMLElement>("[data-hero-label]"))
      : [];
    const clock = { shift: 0 };
    const labelLeft = labelEls.map((label) => label.style.left);
    // Panel corners follow the surface's own radius, so blocks and the whole panel agree.
    let radius = parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0;
    let width = panel.clientWidth;
    let height = panel.clientHeight;
    let dirty = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inside = false;
    let onScreen = true;
    let started = false;
    let stopped = false;

    const render = () => {
      if (!dirty) return;
      dirty = false;
      const cell = width / COLUMNS;
      const rowHeight = height / ROWS;
      const whole =
        all.every((b) => b.w > 0.999 && Math.abs(b.x - b.column) < 0.001) &&
        rows.every((row) => new Set(row.map((b) => b.column)).size === COLUMNS);
      if (whole) {
        surface.style.clipPath = "";
      } else {
        const parts: string[] = [];
        rows.forEach((row, r) =>
          row.forEach((block) => {
            const open = Math.max(0, block.w);
            const start = block.fromRight ? block.x + 1 - open : block.x;
            const left = Math.max(0, start * cell);
            const right = Math.min(width, (start + open) * cell + 0.75);
            if (right - left < 2) return;
            parts.push(
              blockPath(left, r * rowHeight, right - left, rowHeight, radius, {
                tl: r === 0 && left <= 0.5,
                tr: r === 0 && right >= width - 0.5,
                bl: r === ROWS - 1 && left <= 0.5,
                br: r === ROWS - 1 && right >= width - 0.5,
              }),
            );
          }),
        );
        surface.style.clipPath = `path("${parts.join("") || "M0 0Z"}")`;
      }
      // Each piece carries its own thin edge, so touching pieces read as separate tiles.
      rows.forEach((row, r) =>
        row.forEach((block, c) => {
          const seam = seamEls[r * COLUMNS + c];
          if (!seam) return;
          const open = Math.max(0, block.w);
          const start = (block.fromRight ? block.x + 1 - open : block.x) * cell;
          seam.style.display = open * cell < 2 ? "none" : "";
          seam.style.transform = `translate(${start}px, ${r * rowHeight}px)`;
          seam.style.width = `${open * cell}px`;
          seam.style.height = `${rowHeight}px`;
        }),
      );
    };
    // "Scroll down" labels run endlessly to the right; neighbours alternate solid and outline.
    const run = () => {
      const pitch = width / 3.25;
      const loop = pitch * labelEls.length;
      clock.shift = (clock.shift + gsap.ticker.deltaRatio(60) * (width * 0.002)) % loop;
      labelEls.forEach((label, index) => {
        const x = ((index * pitch + clock.shift) % loop) - pitch;
        label.style.left = "0";
        label.style.transform = `translateX(${x}px)`;
        label.style.width = `${pitch}px`;
      });
    };
    const markDirty = () => (dirty = true);
    gsap.ticker.add(render);
    if (labelEls.length > 0) gsap.ticker.add(run);

    const move = (block: Block, vars: gsap.TweenVars) =>
      gsap.to(block, { duration: MOVE_SECONDS, ease: ease.inOut, onUpdate: markDirty, ...vars });

    /** One change: a block slides to a free neighbouring place, closes, or opens. */
    const change = () => {
      const row = rows[Math.floor(Math.random() * ROWS)];
      const open = row.filter((b) => b.w > 0.5);
      const shut = row.filter((b) => b.w <= 0.5);
      const crowded = open.length > COMFORTABLE;
      const choice = Math.random();
      if (choice < 0.4 && open.length > 0) {
        // Slide one place sideways into the spot of a closed block; the two swap places.
        const block = open[Math.floor(Math.random() * open.length)];
        const to = block.column + (Math.random() < 0.5 ? -1 : 1);
        const other = row.find((b) => b.column === to && b.w <= 0.5);
        if (other) {
          other.column = block.column;
          other.x = block.column;
          block.column = to;
          move(block, { x: to });
          return;
        }
      }
      if (!crowded && shut.length > 0 && Math.random() < 0.6) {
        const block = shut[Math.floor(Math.random() * shut.length)];
        block.fromRight = Math.random() < 0.5;
        move(block, { w: 1 });
        return;
      }
      if (open.length > MIN_VISIBLE) {
        const block = open[Math.floor(Math.random() * open.length)];
        block.fromRight = Math.random() < 0.5;
        move(block, { w: 0 });
      }
    };

    const assemble = () => {
      clearTimeout(timer);
      // Everything returns to its own column, so the surface becomes whole again.
      rows.forEach((row) =>
        row.forEach((block, column) => {
          block.column = column;
        }),
      );
      gsap.to(all, {
        w: 1,
        x: (index: number) => index % COLUMNS,
        duration: duration.long,
        ease: ease.out,
        stagger: { each: 0.03, from: "random" },
        overwrite: true,
        onUpdate: markDirty,
      });
    };

    const beat = () => {
      if (stopped) return;
      if (!inside && onScreen && document.visibilityState === "visible") {
        change();
        if (Math.random() < 0.55) gsap.delayedCall(0.35, change);
      }
      timer = setTimeout(beat, BEAT_SECONDS * 1000);
    };

    const cancelReady = onPageReady(() => {
      if (stopped) return;
      started = true;
      if (!inside) timer = setTimeout(beat, 900);
    });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = panel.getBoundingClientRect();
      const now =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (now === inside) return;
      inside = now;
      panel.dataset.heroHover = String(now);
      if (now) assemble();
      else if (started) {
        clearTimeout(timer);
        timer = setTimeout(beat, 600);
      }
    };
    const resize = new ResizeObserver(() => {
      width = panel.clientWidth;
      height = panel.clientHeight;
      radius = parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0;
      markDirty();
    });
    resize.observe(panel);
    const observer = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
    });
    observer.observe(panel);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stopped = true;
      cancelReady();
      clearTimeout(timer);
      gsap.ticker.remove(render);
      gsap.ticker.remove(run);
      gsap.killTweensOf(all);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      surface.style.clipPath = "";
      labelEls.forEach((label) => {
        label.style.transform = "";
        label.style.width = "";
        label.style.left = labelLeft[labelEls.indexOf(label)];
      });
      seamEls.forEach((seam) => {
        seam.style.display = "none";
      });
    };
  }, [stage, content, seams, labels]);
}
