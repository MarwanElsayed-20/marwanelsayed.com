import type { ButtonHTMLAttributes, ReactNode } from "react";
import { BaseLink } from "@/components/ui/link";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet";

const base =
  "inline-flex min-h-11 min-w-11 max-w-full [overflow-wrap:anywhere] items-center justify-center gap-2 rounded-full px-6 text-body font-medium lime-sweep not-disabled:active:translate-y-px disabled:cursor-not-allowed disabled:text-disabled";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-surface not-disabled:hover:text-foreground not-disabled:focus-visible:text-foreground disabled:bg-surface-subtle",
  secondary:
    "border border-border-strong text-foreground not-disabled:hover:border-foreground disabled:border-border",
  quiet: "text-foreground",
};

export function buttonClasses(variant: ButtonVariant): string {
  return cn(base, variants[variant]);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant), className)} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

/** A link that looks like a button. It has no disabled state; use Button for that. */
export function ButtonLink({
  href,
  variant = "primary",
  external,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <BaseLink href={href} external={external} className={cn(buttonClasses(variant), className)}>
      {children}
    </BaseLink>
  );
}
