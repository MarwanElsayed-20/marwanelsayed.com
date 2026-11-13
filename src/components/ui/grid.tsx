import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
} as const;

type GridProps = {
  /** 1 column on mobile, 2 from md, and 3 from lg when columns is 3. */
  columns?: 2 | 3;
  /** Use "ul" and pass <li> children for lists of items. */
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
};

export function Grid({ columns = 3, as: Tag = "div", className, children }: GridProps) {
  return (
    <Tag className={cn("grid gap-stack lg:gap-8", columnClasses[columns], className)}>
      {children}
    </Tag>
  );
}
