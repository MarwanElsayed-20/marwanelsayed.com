import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TextVariant = "body" | "lead" | "small" | "muted";

const variants: Record<TextVariant, string> = {
  body: "text-body text-foreground",
  lead: "text-lead text-foreground",
  small: "text-small text-muted",
  muted: "text-body text-muted",
};

type TextProps = {
  as?: "p" | "span" | "div";
  variant?: TextVariant;
  className?: string;
  children: ReactNode;
};

export function Text({ as: Tag = "p", variant = "body", className, children }: TextProps) {
  return (
    <Tag className={cn("[overflow-wrap:anywhere]", variants[variant], className)}>{children}</Tag>
  );
}
