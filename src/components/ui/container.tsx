import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ContainerWidth = "reading" | "page" | "wide";

const widths: Record<ContainerWidth, string> = {
  reading: "max-w-reading",
  page: "max-w-page",
  wide: "max-w-wide",
};

type ContainerProps = {
  children: ReactNode;
  className?: string;
  width?: ContainerWidth;
};

/** Centers content, applies the fluid page gutter, and caps the width. */
export function Container({ children, className, width = "page" }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-gutter", widths[width], className)}>{children}</div>;
}
