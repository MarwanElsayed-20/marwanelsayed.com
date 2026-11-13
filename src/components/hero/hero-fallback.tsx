import { cn } from "@/lib/cn";

export type FallbackIcon = { name: string; viewBox: string; markup: string };

type HeroFallbackProps = {
  className?: string;
  /** Logos (svg markup with "@rrggbb" fills), drawn flat in the same arrangement as the 3D scene. */
  icons?: readonly FallbackIcon[];
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 400;
const PER_ROW = 4;
const TILE = 130;

/**
 * Static stand-in for the 3D scene: the same technology logos, flat and in their own colours.
 * Server-rendered and works without scripting. Decorative: hidden from assistive technology.
 */
export function HeroFallback({ className, icons = [] }: HeroFallbackProps) {
  const shown = icons.slice(0, PER_ROW * 2);
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      className={cn("h-full w-full", className)}
    >
      {shown.map(({ name, viewBox, markup }, index) => {
        const row = Math.floor(index / PER_ROW);
        const column = index % PER_ROW;
        return (
          <svg
            key={name}
            x={110 + column * 220 + (row % 2) * 40}
            y={50 + row * 170}
            width={TILE}
            height={TILE}
            viewBox={viewBox}
            dangerouslySetInnerHTML={{ __html: markup.replace(/@([0-9a-fA-F]{6})/g, "#$1") }}
          />
        );
      })}
    </svg>
  );
}
