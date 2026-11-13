"use client";

import Link from "next/link";
import {
  Fragment,
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { areaSpans, range, workAreas, workFilters, workPage } from "@/content/site/work-page";
import { isWorkFilter, matchesFilter, type WorkFilter } from "@/lib/projects/filter";
import { progressLabels } from "@/lib/projects/progress";
import type { WorkRow } from "@/lib/projects/work-rows";
import { shellVars, worldOf } from "@/lib/work-world";
import { useWorkWorld } from "./use-work-world";
import { WorkWorld } from "./work-world";

const pad = (value: number) => String(value).padStart(2, "0");

/** Fetches a row's captures ahead of its world. They are small static files, so this is quick. */
function preload(row: WorkRow, only?: "main") {
  for (const image of only ? row.proofs.slice(0, 1) : row.proofs) {
    const element = new window.Image();
    element.decoding = "async";
    element.src = image.src;
  }
}

/** Whether this screen gets colour worlds at all: wide, with a mouse (the same test as the hook). */
const wantsWorlds = () =>
  window.matchMedia("(min-width: 761px)").matches &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const Row = memo(function Row({
  row,
  index,
  visible,
  active,
  register,
}: {
  row: WorkRow;
  index: number;
  visible: boolean;
  active: boolean;
  register: (slug: string, element: HTMLElement | null) => void;
}) {
  const world = worldOf(row.slug);
  const facts = [row.year, row.stack.join(", ")].filter(Boolean).join(" / ");
  return (
    <article
      ref={(element) => register(row.slug, element)}
      className="index-row"
      data-compact={row.compact ? "" : undefined}
      hidden={!visible}
      data-work-entry={row.slug}
      data-project={row.slug}
      data-active={active ? "" : undefined}
      data-reveal="row"
      style={
        {
          "--under-ink": world.tone === "dark" ? world.accent : world.deep,
          "--under-accent": world.accent,
        } as CSSProperties
      }
    >
      <span className="index-number" aria-hidden="true">
        {pad(index + 1)}
      </span>
      <div className="index-title-group">
        <h3>
          <Link href={row.href} data-project-link={row.slug}>
            {row.title}
          </Link>
        </h3>
        {row.compact ? (
          <p>{facts}</p>
        ) : (
          <p>
            {facts}
            <small>{row.role}</small>
            <span className="index-summary">{row.summary}</span>
          </p>
        )}
        {row.parts.length > 0 ? (
          <ul className="index-parts" aria-label={`${row.title}: parts`}>
            {row.parts.map((part) => (
              <li key={part.href}>
                <Link href={part.href} className="lime-sweep rounded-sm">
                  {part.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {row.compact ? (
        <span aria-hidden="true" />
      ) : (
        <ul className="index-disciplines" aria-label={`${row.title}: type of work`}>
          {row.categories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      )}
      <div className="index-row-aside">
        <span className="index-discovery" aria-hidden="true">
          {workPage.open} →
        </span>
        {row.progress ? (
          <span className="status" data-progress={row.progress}>
            {progressLabels[row.progress]}
          </span>
        ) : null}
      </div>
    </article>
  );
});

/**
 * The work directory: filters, then the projects as numbered rows grouped
 * into the two areas of work. A product that is several projects (an ecosystem) is one row with its
 * parts linked inside it. With a mouse, the row under the pointer brings that project's colour
 * world in behind the page (see use-work-world). Without scripting every row is listed and the
 * filters are hidden.
 */
export function WorkIndex({ rows }: { rows: readonly WorkRow[] }) {
  const [filter, setFilter] = useState<WorkFilter>("all");
  const bySlug = useMemo(() => new Map(rows.map((row) => [row.slug, row])), [rows]);
  const spans = useMemo(
    () =>
      rows.length
        ? areaSpans(
            workAreas,
            rows.map((row) => row.section),
          )
        : [],
    [rows],
  );
  const visible = new Set(rows.filter((row) => matchesFilter(row, filter)).map((row) => row.slug));
  const {
    engaged,
    current,
    previous,
    mode,
    rows: rowElements,
    root,
    layer,
    handlers,
    reset,
  } = useWorkWorld({
    prewarm: (slug) => {
      const row = bySlug.get(slug);
      if (row) preload(row);
    },
  });

  useEffect(() => {
    // HashFocus can run before this island hydrates; the destination retains its filter. The
    // filter may also come in the query (?filter=saas-dashboards).
    const initial =
      document.getElementById("work")?.dataset.workFilter ??
      new URLSearchParams(window.location.search).get("filter") ??
      window.location.hash.slice(1);
    const frame = requestAnimationFrame(() => {
      if (isWorkFilter(initial)) setFilter(initial);
    });
    const onFilter = (event: Event) => {
      const value: unknown = (event as CustomEvent).detail;
      if (isWorkFilter(value)) setFilter(value);
    };
    window.addEventListener("work-filter", onFilter);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("work-filter", onFilter);
    };
  }, []);

  // On a screen that gets worlds, the first capture of each row is fetched once the page is idle,
  // so the first hover finds it ready. Nothing is fetched on a phone.
  useEffect(() => {
    if (!wantsWorlds()) return;
    const queue = [...rows];
    let timer = 0;
    const next = () => {
      const row = queue.shift();
      if (!row) return;
      preload(row, "main");
      timer = window.setTimeout(next, 120);
    };
    timer = window.setTimeout(next, 900);
    return () => window.clearTimeout(timer);
  }, [rows]);

  function choose(value: WorkFilter) {
    reset();
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", value);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  function navigateFilters(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  const register = (slug: string, element: HTMLElement | null) => {
    if (element) rowElements.current.set(slug, element);
    else rowElements.current.delete(slug);
  };
  const engagedRow = engaged ? bySlug.get(engaged) : undefined;
  const currentRow = current ? bySlug.get(current) : undefined;
  const previousRow = previous ? bySlug.get(previous) : undefined;
  // The first visible row of each area carries that area's heading.
  const headed = new Map<string, (typeof spans)[number]>();
  for (const span of spans) {
    const first = rows.slice(span.start - 1, span.end).find((row) => visible.has(row.slug));
    if (first) headed.set(first.slug, span);
  }
  // The first visible compact row carries the "More online stores" line.
  const firstCompact = rows.find((row) => row.compact && visible.has(row.slug))?.slug;

  return (
    <div
      className="index-shell"
      style={shellVars(currentRow ? worldOf(currentRow.slug) : undefined) as CSSProperties}
      data-world-active={engaged ? "" : undefined}
    >
      <div data-work-controls className="index-filters">
        <div
          role="group"
          aria-label={workPage.filtersLabel}
          onKeyDown={navigateFilters}
          className="contents"
        >
          {workFilters.map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? "primary" : "secondary"}
              aria-pressed={filter === value}
              data-filter-button
              data-origin-active={
                engagedRow && value !== "all" && matchesFilter(engagedRow, value) ? "" : undefined
              }
              onClick={() => choose(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <p role="status" className="sr-only">
          Showing {visible.size} of {rows.length}
        </p>
      </div>
      <div
        ref={root}
        className="work-index"
        data-work-list
        data-engaged={engaged ? "" : undefined}
        {...handlers}
      >
        <WorkWorld
          current={currentRow}
          previous={previousRow}
          visible={Boolean(engaged)}
          mode={mode}
          layer={layer}
        />
        {rows.map((row, index) => {
          const span = headed.get(row.slug);
          return (
            <Fragment key={row.slug}>
              {span ? (
                <div
                  id={`work-${span.id}`}
                  className="index-collection-break"
                  data-collection={span.id}
                >
                  <span>
                    <bdi dir="ltr">{range(span)}</bdi>
                  </span>
                  <h2>{span.title}</h2>
                  <p>{span.description}</p>
                </div>
              ) : null}
              {row.slug === firstCompact ? (
                <p className="index-more" data-work-more>
                  {workPage.more}
                </p>
              ) : null}
              <Row
                row={row}
                index={index}
                visible={visible.has(row.slug)}
                active={engaged === row.slug}
                register={register}
              />
            </Fragment>
          );
        })}
      </div>
      {visible.size === 0 ? (
        <p className="mt-8 text-body text-muted">No projects in this category yet.</p>
      ) : null}
    </div>
  );
}
