import type { ReactNode } from "react";
import { Heading, type HeadingLevel } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { BaseLink } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

type CardProps = {
  as?: "div" | "article" | "li";
  className?: string;
  children: ReactNode;
};

/** Static surface. No hover behavior. */
export function Card({ as: Tag = "div", className, children }: CardProps) {
  return (
    <Tag
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-surface p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type CardLinkProps = {
  href: string;
  title: string;
  description?: string;
  label?: string;
  /** Optional media (for example an image frame) shown first. It must contain no links or focusable elements. */
  media?: ReactNode;
  /** Visually hidden text appended to the link name, for example the category. */
  hiddenContext?: string;
  headingLevel?: Exclude<HeadingLevel, 1>;
  className?: string;
};

/** Interactive card with exactly one link: the title link is stretched over the whole card. */
export function CardLink({
  href,
  title,
  description,
  label,
  media,
  hiddenContext,
  headingLevel = 3,
  className,
}: CardLinkProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-3 rounded-md border border-border bg-surface p-6 transition-colors duration-(--duration-fast) ease-standard hover:border-border-strong active:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        className,
      )}
    >
      {media ? <div>{media}</div> : null}
      {label ? <Label className="self-start">{label}</Label> : null}
      <Heading level={headingLevel} size="h3" className="[overflow-wrap:anywhere]">
        <BaseLink
          href={href}
          aria-label={hiddenContext ? `${title}, ${hiddenContext}` : undefined}
          className="rounded-sm after:absolute after:inset-0 group-hover:text-accent-strong group-hover:underline group-hover:underline-offset-4 group-active:decoration-4 focus-visible:outline-hidden"
        >
          {title}
          {hiddenContext ? <span className="sr-only">, {hiddenContext}</span> : null}
        </BaseLink>
      </Heading>
      {description ? <Text variant="muted">{description}</Text> : null}
    </article>
  );
}
