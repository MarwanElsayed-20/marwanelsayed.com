import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4";

const tags = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

const sizes: Record<HeadingSize, string> = {
  display: "font-serif text-display font-medium",
  h1: "font-serif text-h1 font-medium",
  h2: "font-serif text-h2 font-medium",
  h3: "font-serif text-h3 font-medium",
  h4: "font-sans text-h4 font-semibold",
};

type HeadingProps = {
  /** Semantic level; keeps the heading order correct. */
  level: HeadingLevel;
  /** Visual size; defaults to the size matching the level. */
  size?: HeadingSize;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Heading({ level, size, id, className, children }: HeadingProps) {
  const Tag = tags[level];
  const visual: HeadingSize = size ?? tags[level];
  return (
    <Tag
      id={id}
      className={cn(
        "text-balance text-foreground [overflow-wrap:anywhere]",
        sizes[visual],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
