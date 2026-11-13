import { useId, type ReactNode } from "react";
import { Container, type ContainerWidth } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

type SectionProps = {
  heading?: string;
  intro?: string;
  headingLevel?: 2 | 3;
  tone?: "plain" | "subtle";
  width?: ContainerWidth;
  id?: string;
  tabIndex?: number;
  className?: string;
  children?: ReactNode;
};

/** Page section with the standard vertical rhythm and an optional heading and intro. */
export function Section({
  heading,
  intro,
  headingLevel = 2,
  tone = "plain",
  width = "page",
  id,
  tabIndex,
  className,
  children,
}: SectionProps) {
  const headingId = useId();
  return (
    <section
      id={id}
      tabIndex={tabIndex}
      aria-labelledby={heading ? headingId : undefined}
      className={cn("py-section", tone === "subtle" && "bg-surface-subtle", className)}
    >
      <Container width={width}>
        {heading ? (
          <div className="mb-10 flex flex-col gap-4">
            <Heading level={headingLevel} id={headingId}>
              {heading}
            </Heading>
            {intro ? (
              <Text variant="lead" className="max-w-reading">
                {intro}
              </Text>
            ) : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
