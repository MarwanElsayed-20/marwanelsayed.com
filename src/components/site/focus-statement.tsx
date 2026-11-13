import { Fragment } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PERSPECTIVE } from "@/lib/focus-statement";
import { FocusStatementMotion } from "./focus-statement-motion";

/**
 * What the owner works on, set large between the hero and Selected work. The words are real text
 * in the page; with motion on the screen pins and scrolling brings them out of a scatter into the
 * paragraph, and back out on the way up (see FocusStatementMotion). The words are direct children
 * of the paragraph, which carries the perspective they are scattered in. The optional button under it
 * comes in once the last word has landed.
 */
export function FocusStatement({
  text,
  action,
}: {
  text: string;
  action?: { label: string; href: string };
}) {
  const words = text.split(" ");
  return (
    <section aria-label="What I work on" className="overflow-clip">
      <FocusStatementMotion>
        <Container className="w-full py-section">
          <p
            style={{ perspective: `${PERSPECTIVE}px` }}
            className="text-center text-pretty text-[clamp(1.1rem,5.6vw,2.2rem)] leading-[1.3] font-normal tracking-[-0.01em] text-foreground md:text-[min(3.1vw,5.6svh)]"
          >
            {words.map((word, index) => (
              <Fragment key={index}>
                <span data-focus-word className="inline-block will-change-[transform,opacity]">
                  {word}
                </span>
                {index < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>
          {action ? (
            <div data-focus-action className="mt-[clamp(2rem,5svh,3.5rem)] flex justify-center">
              <ButtonLink href={action.href}>{action.label}</ButtonLink>
            </div>
          ) : null}
        </Container>
      </FocusStatementMotion>
    </section>
  );
}
