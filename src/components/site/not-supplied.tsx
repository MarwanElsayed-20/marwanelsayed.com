import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export type NotSuppliedLink = {
  readonly href: string;
  readonly label: string;
};

/** Links offered on a page that has no content yet: the other destinations, in navigation order. */
export function destinationLinks(exclude: string): NotSuppliedLink[] {
  const all: NotSuppliedLink[] = [
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ];
  return all.filter((link) => link.href !== exclude.replace(/^\/contact$/, "/#contact"));
}

type NotSuppliedProps = {
  /** The section heading. */
  title: string;
  message: string;
  links: readonly NotSuppliedLink[];
};

/** Honest state for a page whose required content has not been supplied yet. */
export function NotSupplied({ title, message, links }: NotSuppliedProps) {
  return (
    <Section id={title.toLowerCase()} tabIndex={-1} heading={title} intro={message}>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <ButtonLink key={link.href} href={link.href} variant="secondary">
            {link.label}
          </ButtonLink>
        ))}
      </div>
    </Section>
  );
}
