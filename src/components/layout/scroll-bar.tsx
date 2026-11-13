"use client";

import { useEffect, useRef } from "react";

const MIN_THUMB = 36;

/**
 * The page's own scroll bar (the system one is hidden). The thumb is as long as the screen is to
 * the page and can be dragged. It is only decoration for pointers: scrolling itself stays native, so
 * wheel, touch and keyboard behave as usual. It is hidden when the page does not scroll.
 */
export function ScrollBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    const root = document.documentElement;
    let frame: number | undefined;
    let dragFrom: { pointer: number; scroll: number } | null = null;

    const metrics = () => {
      const room = Math.max(0, root.scrollHeight - window.innerHeight);
      const trackHeight = track.clientHeight;
      const length = Math.min(
        trackHeight,
        Math.max(MIN_THUMB, (trackHeight * window.innerHeight) / Math.max(1, root.scrollHeight)),
      );
      return { room, trackHeight, length };
    };

    const update = () => {
      frame = undefined;
      const { room, trackHeight, length } = metrics();
      track.dataset.active = String(room > 4);
      thumb.style.height = `${length}px`;
      const progress = room > 0 ? window.scrollY / room : 0;
      thumb.style.transform = `translateY(${Math.min(1, Math.max(0, progress)) * (trackHeight - length)}px)`;
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };

    const onDown = (event: PointerEvent) => {
      event.preventDefault();
      thumb.setPointerCapture(event.pointerId);
      dragFrom = { pointer: event.clientY, scroll: window.scrollY };
    };
    const onMove = (event: PointerEvent) => {
      if (!dragFrom) return;
      const { room, trackHeight, length } = metrics();
      const travel = Math.max(1, trackHeight - length);
      window.scrollTo({
        top: dragFrom.scroll + ((event.clientY - dragFrom.pointer) / travel) * room,
        behavior: "instant",
      });
    };
    const onUp = (event: PointerEvent) => {
      dragFrom = null;
      if (thumb.hasPointerCapture(event.pointerId)) thumb.releasePointerCapture(event.pointerId);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    thumb.addEventListener("pointerdown", onDown);
    thumb.addEventListener("pointermove", onMove);
    thumb.addEventListener("pointerup", onUp);
    thumb.addEventListener("pointercancel", onUp);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      thumb.removeEventListener("pointerdown", onDown);
      thumb.removeEventListener("pointermove", onMove);
      thumb.removeEventListener("pointerup", onUp);
      thumb.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={trackRef} data-scrollbar data-active="false" aria-hidden="true">
      <div ref={thumbRef} data-scrollbar-thumb />
    </div>
  );
}
