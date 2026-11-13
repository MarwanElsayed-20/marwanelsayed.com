import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

/** Closing actions for project pages. */
export function NextSteps() {
  return (
    <section aria-label="Next steps" className="pb-section">
      <Container>
        <div className="flex flex-col gap-4 border-t border-border pt-8">
          <Text>Want to see more, or get in touch?</Text>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/#contact">Contact</ButtonLink>
            <ButtonLink href="/work" variant="secondary">
              More work
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
