import NextLink from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

type BaseLinkProps = {
  href: string;
  className?: string;
  "aria-label"?: string;
  /** Defaults to true for absolute http(s) URLs. */
  external?: boolean;
  children: ReactNode;
};

/** Shared anchor used by Link, ButtonLink, and CardLink: next/link for internal, <a> for external. */
export function BaseLink({
  href,
  className,
  external,
  children,
  "aria-label": ariaLabel,
}: BaseLinkProps) {
  if (external ?? isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel ? `${ariaLabel} (opens in a new tab)` : undefined}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <NextLink href={href} className={className} aria-label={ariaLabel}>
      {children}
    </NextLink>
  );
}

export type LinkVariant = "inline" | "standalone";

const base = "lime-sweep rounded-sm";

const variants: Record<LinkVariant, string> = {
  inline:
    "text-accent underline decoration-1 underline-offset-4 hover:text-foreground focus-visible:text-foreground",
  standalone: "text-foreground",
};

type LinkProps = BaseLinkProps & { variant?: LinkVariant };

export function Link({ variant = "inline", className, ...props }: LinkProps) {
  return <BaseLink {...props} className={cn(base, variants[variant], className)} />;
}
