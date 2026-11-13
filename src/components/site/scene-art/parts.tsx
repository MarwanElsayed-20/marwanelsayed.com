import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ProjectImage } from "@/lib/projects/types";
import art from "../selected-work-art.json";

/** A box on a stage, in percent of the stage's width (left, right, width) and height (top, bottom). */
export type Box = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number;
  /** Degrees; applied with the `rotate` property so motion can still move the piece. */
  rotate?: number;
  z?: number;
};

const pct = (value?: number) => (value === undefined ? undefined : `${value}%`);

export function place(box: Box): CSSProperties {
  return {
    left: pct(box.left),
    right: pct(box.right),
    top: pct(box.top),
    bottom: pct(box.bottom),
    width: pct(box.width),
    rotate: box.rotate ? `${box.rotate}deg` : undefined,
    zIndex: box.z,
  };
}

/**
 * A scene's artwork stage: a fixed-shape box (width over height = `ratio`) as large as the artwork
 * area allows, so a composition keeps its proportions on every screen. Everything inside is placed
 * in percent of the stage and sized in `cqw` (stage width).
 */
export function Stage({
  ratio,
  align,
  children,
}: {
  ratio: number;
  /** Where the stage sits in the artwork area when the shapes differ. */
  align: { x: "left" | "centre" | "right"; y: "top" | "centre" | "bottom" };
  children: ReactNode;
}) {
  return (
    <div
      data-art-stage
      style={{
        ["--stage-ratio" as string]: ratio,
        left: align.x === "right" ? "auto" : 0,
        right: align.x === "left" ? "auto" : 0,
        top: align.y === "bottom" ? "auto" : 0,
        bottom: align.y === "top" ? "auto" : 0,
      }}
    >
      {children}
    </div>
  );
}

/** A real capture in a plain window frame. */
export function CaptureFrame({ image, sizes }: { image: ProjectImage; sizes: string }) {
  return (
    <div className="overflow-hidden rounded-[0.9cqw] bg-(--scene-frame) shadow-[0_2.4cqw_4.8cqw_-1.6cqw_color-mix(in_srgb,var(--color-foreground)_55%,transparent)] ring-1 ring-(--scene-line)">
      <div className="flex gap-[0.45cqw] border-b border-(--scene-line) px-[0.9cqw] py-[0.65cqw]">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-[0.6cqw] rounded-full bg-(--scene-frame-dot)" />
        ))}
      </div>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt=""
        sizes={sizes}
        className="block aspect-[16/10] h-auto w-full object-cover object-top"
      />
    </div>
  );
}

/** A capture placed on the stage; it slides in with the scene. */
export function Capture({
  image,
  box,
  sizes = "(min-width: 1024px) 40vw, 80vw",
  href,
}: {
  image: ProjectImage;
  box: Box;
  sizes?: string;
  /** The main capture links to the scene's case study (out of the tab order; the text link is the way in). */
  href?: string;
}) {
  const frame = <CaptureFrame image={image} sizes={sizes} />;
  return href ? (
    <a
      href={href}
      tabIndex={-1}
      data-art-piece="main"
      className="absolute block"
      style={place(box)}
    >
      {frame}
    </a>
  ) : (
    <div data-art-piece className="absolute block" style={place(box)}>
      {frame}
    </div>
  );
}

/** One of the rendered objects in public/selected-work; it drops in after the captures. */
export function ArtObject({ name, box }: { name: keyof typeof art; box: Box }) {
  return (
    <div data-art-object className="pointer-events-none absolute" style={place(box)}>
      <Image
        src={`/selected-work/${name}.webp`}
        width={art[name].width}
        height={art[name].height}
        alt=""
        sizes="(min-width: 1024px) 16vw, 30vw"
        className="block h-auto w-full"
      />
    </div>
  );
}

/** A small uppercase caption on the stage. */
export function Caption({
  children,
  box,
  tone = "accent",
}: {
  children: ReactNode;
  box: Box;
  tone?: "accent" | "muted" | "ink";
}) {
  const colour = {
    accent: "text-(--scene-accent)",
    muted: "text-(--scene-muted)",
    ink: "text-(--scene-ink)",
  }[tone];
  return (
    <p
      data-art-caption
      className={`absolute text-[clamp(0.55rem,1.05cqw,0.85rem)] font-semibold tracking-[0.16em] whitespace-nowrap uppercase ${colour}`}
      style={place(box)}
    >
      {children}
    </p>
  );
}

/** A pill label, for flow steps and statuses drawn from the product. Too small to read on a narrow stage, so it hides there. */
export function Pill({
  children,
  box,
  tone = "accent",
}: {
  children: ReactNode;
  box: Box;
  tone?: "accent" | "outline" | "frame";
}) {
  const look = {
    accent: "bg-(--scene-accent) text-(--scene-bg)",
    outline: "border border-(--scene-accent) text-(--scene-accent) bg-(--scene-bg)",
    frame: "bg-(--scene-frame) text-(--scene-ink) ring-1 ring-(--scene-line)",
  }[tone];
  return (
    <span
      data-art-caption
      className={`absolute rounded-full px-[1.1cqw] py-[0.45cqw] text-[clamp(0.5rem,1cqw,0.8rem)] font-semibold tracking-[0.1em] whitespace-nowrap uppercase @max-[34rem]:hidden ${look}`}
      style={place(box)}
    >
      {children}
    </span>
  );
}

/**
 * Lines on the stage, drawn in a viewBox the same shape as the stage (100 wide). `draw` paths draw
 * themselves when the scene arrives; `flow` paths carry a slow moving dash afterwards; travellers
 * are dots that run along a path while motion is on.
 */
export function Lines({
  ratio,
  draw = [],
  flow = [],
  travellers = [],
  dots = [],
}: {
  ratio: number;
  draw?: readonly string[];
  flow?: readonly string[];
  travellers?: readonly { path: string; duration: number; delay?: number }[];
  dots?: readonly (readonly [number, number])[];
}) {
  const height = 100 / ratio;
  return (
    <svg
      data-art-lines
      viewBox={`0 0 100 ${height}`}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      {draw.map((d) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="stroke-(--scene-accent)"
          strokeWidth={1.25}
        />
      ))}
      {flow.map((d) => (
        <path
          key={`flow-${d}`}
          data-art-flow
          d={d}
          fill="none"
          vectorEffect="non-scaling-stroke"
          className="stroke-(--scene-accent)"
          strokeWidth={1.25}
          strokeDasharray="2 6"
        />
      ))}
      {dots.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          data-art-dot
          cx={x}
          cy={y}
          r={0.55}
          className="fill-(--scene-accent)"
        />
      ))}
      {travellers.map(({ path, duration, delay = 0 }) => (
        // Hidden until the stage starts it (motion on only), so it never rests at the origin.
        <circle
          key={`t-${path}-${delay}`}
          data-art-traveller
          data-delay={delay}
          r={0.5}
          opacity={0}
          className="fill-(--scene-ink)"
        >
          <animateMotion
            dur={`${duration}s`}
            begin="indefinite"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      ))}
    </svg>
  );
}

/**
 * A detail pulled out of a capture and magnified, like a cut-out: `crop` is the region of the
 * capture in percent (x, y, width, height of the image).
 */
export function Detail({
  image,
  crop,
  box,
  vw,
  bare = false,
}: {
  image: ProjectImage;
  crop: { x: number; y: number; w: number; h: number };
  box: Box;
  /** Roughly how wide the cut-out shows on a wide screen, in vw: picks a sharp enough source. */
  vw: number;
  /** Just the cut-out, filling its parent: no card look and no motion of its own. */
  bare?: boolean;
}) {
  const ratio = (crop.w * image.width) / (crop.h * image.height);
  // The whole capture is drawn this many times wider than the cut-out.
  const source = Math.min(200, Math.round((vw * 100) / crop.w));
  const sizes = `(min-width: 1024px) ${source}vw, ${Math.min(300, source * 2)}vw`;
  return (
    <div
      data-art-piece={bare ? undefined : ""}
      className={
        bare
          ? "relative w-full overflow-hidden"
          : "absolute overflow-hidden rounded-[0.7cqw] bg-surface shadow-[0_2cqw_4cqw_-1.2cqw_color-mix(in_srgb,var(--color-foreground)_60%,transparent)] ring-1 ring-(--scene-line)"
      }
      style={bare ? { aspectRatio: ratio } : { ...place(box), aspectRatio: ratio }}
    >
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt=""
        sizes={sizes}
        className="absolute max-w-none"
        style={{
          width: `${(100 / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </div>
  );
}
