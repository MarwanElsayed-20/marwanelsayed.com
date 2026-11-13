"use client";

import Image from "next/image";
import { memo, useState, type CSSProperties, type RefObject } from "react";
import type { WorkRow } from "@/lib/projects/work-rows";
import { sceneVars, worldOf, type HoverKind } from "@/lib/work-world";

/** The least a capture is laid out wider than tall: a tall phone screen still gets a frame. */
const aspectOf = (image: { width: number; height: number }) =>
  Math.max(image.width / image.height, 0.8);

/** One capture in its frame. The frame stays hidden until the image is in, so no blank print shows. */
function Proof({
  image,
  className,
  sizes,
  tall,
}: {
  image: { src: string; width: number; height: number };
  className: string;
  sizes: string;
  tall?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`index-proof ${className}`}
      data-tall={tall || undefined}
      data-loaded={loaded ? "" : undefined}
      style={{ aspectRatio: aspectOf(image) } as CSSProperties}
    >
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes}
        unoptimized
        draggable={false}
        ref={(element) => {
          if (element?.complete) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/** The captures, laid like prints on the world: the card large, a second screen beside it. */
function Proofs({ row }: { row: WorkRow }) {
  const [main, second] = row.proofs;
  if (!main) return null;
  return (
    <div className="index-world-proof">
      <Proof
        image={main}
        className="index-proof-main"
        sizes="(max-width: 900px) 90vw, 52vw"
        tall={aspectOf(main) < 1.2}
      />
      {second ? <Proof image={second} className="index-proof-second" sizes="26vw" /> : null}
    </div>
  );
}

const Scene = memo(function Scene({
  row,
  state,
  visible,
}: {
  row: WorkRow;
  state: "current" | "previous";
  visible: boolean;
}) {
  const world = worldOf(row.slug);
  const where = [row.year, ...row.categories].filter(Boolean);
  return (
    <div
      className={`index-world-scene is-${state}`}
      data-visible={visible ? "" : undefined}
      data-world={row.slug}
      data-pattern={row.categoryId}
      style={sceneVars(world)}
    >
      <div className="index-world-atmosphere" />
      <div className="index-world-ambient" />
      <Proofs row={row} />
      <div className="index-world-register">
        <span>{row.title}</span>
        <span>{where.join(" / ")}</span>
      </div>
    </div>
  );
});

/**
 * The colour world that fills the screen behind the Work index while a row is hovered: the
 * project's own colours, a pattern for the kind of work, its captures laid on top, and a line
 * tying it back to the row it came from. Decoration only, so it is hidden from assistive
 * technology; the row carries every fact.
 */
export const WorkWorld = memo(function WorkWorld({
  current,
  previous,
  visible,
  mode,
  layer,
}: {
  current: WorkRow | undefined;
  previous: WorkRow | undefined;
  visible: boolean;
  mode: HoverKind;
  layer: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={layer}
      className="work-index-world"
      data-visible={visible ? "" : undefined}
      data-input={mode}
      aria-hidden="true"
    >
      {previous ? <Scene key={previous.slug} row={previous} state="previous" visible /> : null}
      {current ? (
        <Scene key={current.slug} row={current} state="current" visible={visible} />
      ) : null}
      <div className="index-world-source">
        <i />
        <span />
        <i />
      </div>
    </div>
  );
});
