"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { commitDelay, hoverTiming, isRapid, pointerOf, type HoverKind } from "@/lib/work-world";

const ROW = ".index-row[data-project]";

/** The world is for a wide screen with a pointer; a phone or a tablet keeps the plain list. */
function worldsWanted(): boolean {
  return (
    window.matchMedia("(min-width: 761px)").matches &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/**
 * The state of the Work index's colour world. A row under the pointer is
 * first only *intended* (it takes a hover colour at once); after a short wait it is *committed*:
 * its world takes over the page, wiping out from the row's own height. Moving to another row
 * brings its world in over the last one, faster when the pointer is moving between rows. Leaving
 * the list lets the world go. The keyboard gets the same, without the pointer drift.
 *
 * `engaged` drives the page's own colours, `current` and `previous` are the worlds on screen (a
 * world stays rendered while it fades out), and `mode` is how the row was reached.
 */
export function useWorkWorld(options: { prewarm: (slug: string) => void }) {
  const { prewarm } = options;
  const [engaged, setEngaged] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [mode, setMode] = useState<HoverKind>("pointer");

  const rows = useRef(new Map<string, HTMLElement>());
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const committed = useRef<string | null>(null);
  const outgoing = useRef<string | null>(null);
  const intent = useRef<string | null>(null);
  const intentRow = useRef<HTMLElement | null>(null);
  const token = useRef(0);
  const lastStamp = useRef(0);
  const warmed = useRef(new Set<string>());
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const timers = useRef({
    commit: null as number | null,
    hide: null as number | null,
    reset: null as number | null,
    previous: null as number | null,
    prewarm: null as number | null,
    settle: null as number | null,
  });

  const clear = useCallback((...names: (keyof typeof timers.current)[]) => {
    for (const name of names) {
      const id = timers.current[name];
      if (id !== null) window.clearTimeout(id);
      timers.current[name] = null;
    }
  }, []);

  const mark = useCallback((slug: string | null, row: HTMLElement | null) => {
    if (intentRow.current !== row) intentRow.current?.removeAttribute("data-intent");
    intentRow.current = row;
    intent.current = slug;
    row?.setAttribute("data-intent", "");
  }, []);

  const originOf = useCallback((row: HTMLElement) => {
    const box = row.getBoundingClientRect();
    layer.current?.style.setProperty(
      "--world-origin-y",
      `${Math.round(box.top + box.height / 2)}px`,
    );
  }, []);

  const commit = useCallback(
    (slug: string, ticket: number, rapid: boolean) => {
      if (ticket !== token.current || intent.current !== slug) return;
      const row = rows.current.get(slug);
      if (row) originOf(row);
      if (root.current) {
        root.current.dataset.transition = rapid ? "rapid" : "normal";
        delete root.current.dataset.worldSettled;
      }
      const last = committed.current;
      if (last && last !== slug) {
        outgoing.current = last;
        setPrevious(last);
        clear("previous");
        timers.current.previous = window.setTimeout(
          () => {
            if (outgoing.current === last) {
              outgoing.current = null;
              setPrevious(null);
            }
          },
          rapid ? hoverTiming.previous.rapid : hoverTiming.previous.normal,
        );
      }
      committed.current = slug;
      setCurrent(slug);
      setEngaged(slug);
      clear("settle");
      timers.current.settle = window.setTimeout(() => {
        if (ticket === token.current && committed.current === slug)
          root.current?.setAttribute("data-world-settled", "");
      }, hoverTiming.settle);
    },
    [clear, originOf],
  );

  const engage = useCallback(
    (slug: string, kind: HoverKind, stamp: number, row: HTMLElement) => {
      if (intent.current === slug && committed.current === slug) return;
      clear("commit", "hide", "reset");
      const rapid = isRapid(kind, lastStamp.current, stamp);
      lastStamp.current = stamp;
      const ticket = ++token.current;
      mark(slug, row);
      setMode(kind);
      clear("prewarm");
      timers.current.prewarm = window.setTimeout(
        () => {
          if (ticket === token.current && intent.current === slug && !warmed.current.has(slug)) {
            warmed.current.add(slug);
            prewarm(slug);
          }
        },
        kind === "keyboard" ? hoverTiming.prewarm.keyboard : hoverTiming.prewarm.pointer,
      );
      timers.current.commit = window.setTimeout(
        () => commit(slug, ticket, rapid),
        commitDelay(kind, rapid),
      );
    },
    [clear, commit, mark, prewarm],
  );

  const release = useCallback(() => {
    token.current += 1;
    mark(null, null);
    clear("commit", "prewarm", "settle");
    timers.current.hide = window.setTimeout(() => setEngaged(null), hoverTiming.hide);
    timers.current.reset = window.setTimeout(() => {
      committed.current = null;
      outgoing.current = null;
      setCurrent(null);
      setPrevious(null);
      root.current?.removeAttribute("data-world-settled");
    }, hoverTiming.reset);
  }, [clear, mark]);

  /** A filter change drops the world at once, with no fade. */
  const reset = useCallback(() => {
    clear("commit", "hide", "reset", "previous", "prewarm", "settle");
    token.current += 1;
    mark(null, null);
    committed.current = null;
    outgoing.current = null;
    setEngaged(null);
    setCurrent(null);
    setPrevious(null);
    root.current?.removeAttribute("data-world-settled");
  }, [clear, mark]);

  useEffect(() => {
    const timerSet = timers.current;
    return () => {
      for (const id of Object.values(timerSet)) if (id !== null) window.clearTimeout(id);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  // While a world is up its wipe starts at the engaged row's height, so that follows the row as
  // the page scrolls or reflows.
  useLayoutEffect(() => {
    if (!engaged) return;
    const row = rows.current.get(engaged);
    if (!row) return;
    let queued = 0;
    const place = () => {
      queued = 0;
      originOf(row);
      // The world must not paint over the footer that is uncovered below the page.
      const page = root.current?.closest("main") ?? root.current;
      const end = page?.getBoundingClientRect().bottom ?? window.innerHeight;
      layer.current?.style.setProperty(
        "--world-bottom",
        `${Math.max(0, window.innerHeight - end)}px`,
      );
    };
    const schedule = () => {
      if (!queued) queued = window.requestAnimationFrame(place);
    };
    place();
    const observer = new ResizeObserver(schedule);
    observer.observe(row);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.cancelAnimationFrame(queued);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [engaged, originOf]);

  const rowOf = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>(ROW) : null;

  const handlers = {
    onPointerOver(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse" || !worldsWanted()) return;
      const row = rowOf(event.target);
      if (!row || row.hidden || rowOf(event.relatedTarget) === row) return;
      const slug = row.dataset.project;
      if (slug) engage(slug, "pointer", event.timeStamp, row);
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse" || document.hidden || !committed.current) return;
      pointer.current = pointerOf(
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
      );
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        layer.current?.style.setProperty("--world-pointer-x", pointer.current.x.toFixed(2));
        layer.current?.style.setProperty("--world-pointer-y", pointer.current.y.toFixed(2));
      });
    },
    onPointerLeave() {
      release();
    },
    onFocusCapture(event: FocusEvent<HTMLDivElement>) {
      if (!worldsWanted()) return;
      const row = rowOf(event.target);
      const slug = row?.dataset.project;
      if (row && slug) engage(slug, "keyboard", event.timeStamp, row);
    },
    onBlurCapture(event: FocusEvent<HTMLDivElement>) {
      if (!event.currentTarget.contains(event.relatedTarget)) release();
    },
  };

  return {
    engaged,
    current,
    previous,
    mode,
    rows: rows as RefObject<Map<string, HTMLElement>>,
    root,
    layer,
    handlers,
    reset,
  };
}
