"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { ProjectImage } from "@/lib/projects/types";
import {
  canMove,
  keyAction,
  moveScreen,
  positionText,
  type ScreenAction,
} from "@/lib/projects/screen-viewer";
import { isSampleImageSrc } from "@/lib/projects/sample";

export type ScreenViewerProps = { screens: readonly ProjectImage[]; title: string; label: string };
const control =
  "min-h-11 min-w-11 rounded-sm border border-border px-3 py-2 text-small disabled:text-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const captionFor = (screen: ProjectImage, index: number) =>
  screen.caption ?? screen.alt ?? `Screen ${index + 1}`;
const altFor = (screen: ProjectImage, index: number) =>
  screen.alt ?? screen.caption ?? `Screen ${index + 1}`;

function Capture({
  image,
  index,
  title,
  natural = false,
}: {
  image: ProjectImage;
  index: number;
  title: string;
  natural?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={altFor(image, index)}
        className="flex h-full min-h-44 items-center justify-center font-serif text-display text-muted"
      >
        {Array.from(title.trim())[0]?.toUpperCase()}
      </div>
    );
  return (
    <Image
      src={image.src}
      width={image.width}
      height={image.height}
      alt={altFor(image, index)}
      loading="lazy"
      sizes="(min-width: 1024px) 70vw, 100vw"
      unoptimized={isSampleImageSrc(image.src)}
      onError={() => setFailed(true)}
      className={natural ? "h-auto max-w-full" : "h-full w-full object-contain object-top"}
    />
  );
}

export function ScreenViewer({ screens, title, label }: ScreenViewerProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const restoreScroll = useRef<(() => void) | undefined>(undefined);
  const dialogTitle = useId();
  const dialogCaption = useId();
  useEffect(() => () => restoreScroll.current?.(), []);
  function closeDialog() {
    setOpen(false);
    restoreScroll.current?.();
    restoreScroll.current = undefined;
    opener.current?.focus({ preventScroll: true });
  }
  function openDialog() {
    if (!dialog.current || dialog.current.open) return;
    const root = document.documentElement;
    const { overflow, paddingRight, scrollBehavior } = root.style;
    const x = window.scrollX,
      y = window.scrollY;
    const gutter = window.innerWidth - root.clientWidth;
    root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + gutter}px`;
    root.style.overflow = "hidden";
    restoreScroll.current = () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
      root.style.scrollBehavior = "auto";
      window.scrollTo(x, y);
      root.style.scrollBehavior = scrollBehavior;
    };
    setOpen(true);
    dialog.current.showModal();
  }
  const current = screens[index];
  const available = canMove(index, screens.length);
  const multiple = screens.length > 1;
  function move(action: ScreenAction) {
    setIndex((value) => moveScreen(value, screens.length, action));
  }
  function onKeyDown(event: KeyboardEvent) {
    // Native modal inertness stays in charge; keep boundary Tab presses in the document too.
    if (event.key === "Tab" && dialog.current?.open) {
      const controls = Array.from(
        dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]'),
      );
      const first = controls[0],
        last = controls.at(-1);
      if (document.activeElement === (event.shiftKey ? first : last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus({ preventScroll: true });
      }
      return;
    }
    const action = keyAction(event.key);
    if (action === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    move(action);
  }
  if (!current) return null;
  return (
    <div
      data-screen-viewer
      role="group"
      aria-label={`${label} screens`}
      onKeyDown={onKeyDown}
      className="min-w-0 space-y-4 [overflow-wrap:anywhere]"
    >
      <figure className="min-w-0 space-y-3">
        <div
          data-preview-frame
          className="overflow-hidden rounded-md border border-border bg-surface-subtle shadow-sm"
        >
          <div aria-hidden="true" className="flex gap-1.5 border-b border-border px-4 py-3">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            ))}
          </div>
          <div data-screen-frame className="aspect-[16/10] overflow-hidden">
            <Capture key={current.src} image={current} index={index} title={title} />
          </div>
        </div>
        {/* Overlay captions to reserve the tallest wrapped caption before hydration. */}
        <figcaption className="grid text-small text-muted">
          {screens.map((image, i) => (
            <span
              key={i}
              aria-hidden={i !== index ? true : undefined}
              className={`col-start-1 row-start-1 ${i !== index ? "invisible" : ""}`}
            >
              {captionFor(image, i)}
            </span>
          ))}
        </figcaption>
      </figure>
      {multiple ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className={control}
              disabled={!available.previous}
              onClick={() => move("previous")}
            >
              Previous
            </button>
            <span data-screen-position className="text-small tabular-nums">
              {positionText(index, screens.length)}
            </span>
            <button
              type="button"
              className={control}
              disabled={!available.next}
              onClick={() => move("next")}
            >
              Next
            </button>
          </div>
          <ul
            aria-label={`${label} thumbnails`}
            className="flex gap-3 overflow-x-auto p-1 lg:grid lg:grid-cols-3"
          >
            {screens.map((image, i) => (
              <li key={i} className="w-28 shrink-0 lg:w-auto">
                <button
                  type="button"
                  aria-label={`Show screen ${i + 1}: ${captionFor(image, i)}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => move(i)}
                  className={`${control} w-full p-1 ${i === index ? "border-accent" : ""}`}
                >
                  <span className="block aspect-[16/10] overflow-hidden">
                    <Image
                      src={image.src}
                      width={image.width}
                      height={image.height}
                      alt=""
                      loading="lazy"
                      sizes="160px"
                      unoptimized={isSampleImageSrc(image.src)}
                      className="h-full w-full object-contain object-top"
                    />
                  </span>
                  <span aria-hidden="true">{i + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <button ref={opener} type="button" className={control} onClick={openDialog}>
        View full size
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${dialogTitle} ${dialogCaption}`}
        onClose={closeDialog}
        onCancel={(event) => {
          event.preventDefault();
          dialog.current?.close();
        }}
        className="fixed inset-0 m-auto h-[90dvh] max-h-[90dvh] w-[96vw] max-w-[96vw] overflow-hidden rounded-md border border-border bg-surface p-4 text-foreground shadow-sm backdrop:bg-foreground/60"
      >
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span id={dialogTitle} className="font-serif">
              {title}
            </span>
            <button
              type="button"
              autoFocus
              className={control}
              onClick={() => dialog.current?.close()}
            >
              Close
            </button>
          </div>
          <p id={dialogCaption} className="text-small text-muted">
            {captionFor(current, index)}
          </p>
          <div
            data-screen-scroll
            data-lenis-prevent
            role="region"
            aria-label="Full-size screen"
            tabIndex={0}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {open ? (
              <Capture key={current.src} image={current} index={index} title={title} natural />
            ) : null}
          </div>
          {multiple ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                className={control}
                disabled={!available.previous}
                onClick={() => move("previous")}
              >
                Previous
              </button>
              <span data-screen-position className="text-small tabular-nums">
                {positionText(index, screens.length)}
              </span>
              <button
                type="button"
                className={control}
                disabled={!available.next}
                onClick={() => move("next")}
              >
                Next
              </button>
            </div>
          ) : null}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            Screen {positionText(index, screens.length)}: {captionFor(current, index)}
          </p>
        </div>
      </dialog>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        Screen {positionText(index, screens.length)}: {captionFor(current, index)}
      </p>
    </div>
  );
}
