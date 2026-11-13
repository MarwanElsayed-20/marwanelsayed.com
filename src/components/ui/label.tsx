import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type LabelTone = "neutral" | "accent";

const tones: Record<LabelTone, string> = {
  neutral: "text-muted",
  accent: "text-accent",
};

type LabelProps = {
  tone?: LabelTone;
  className?: string;
  children: ReactNode;
};

/** Small uppercase tag. Non-interactive; inside a link it inherits that link's states. */
export function Label({ tone = "neutral", className, children }: LabelProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm bg-surface-subtle px-2 py-1 text-label font-medium uppercase [overflow-wrap:anywhere]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
