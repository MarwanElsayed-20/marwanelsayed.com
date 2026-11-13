import { useId } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import type { ProjectSection } from "@/lib/projects/types";

/** Shown when a section has no projects. Names no project, client, or date. */
export function EmptyState({ section }: { section: ProjectSection }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="pb-section">
      <Container>
        <div className="flex max-w-reading flex-col items-start gap-4 rounded-md border border-border bg-surface-subtle p-8">
          <Heading level={2} id={headingId}>
            {section.empty.heading}
          </Heading>
          <Text variant="muted">{section.empty.body}</Text>
          <ButtonLink href={section.empty.linkHref} variant="secondary">
            {section.empty.linkLabel}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
