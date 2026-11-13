import type { CSSProperties } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import type { WorkNeighbors } from "@/lib/projects/work";
import { worldOf } from "@/lib/work-world";

/** The arrow after the next project's name: it slides and takes the next project's colour on hover. */
function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="case-next-arrow"
    >
      <path d="M3 12h17M14 6l6 6-6 6" />
    </svg>
  );
}

/**
 * The end of a case study: "Continue exploring" with the next project's name
 * set large, a line about it, and the way back. The band is this project's colour with the next
 * project's cut into its corner, and a bar in the next project's accent along the bottom.
 */
export function CaseStudyNeighbors({ previous, next }: WorkNeighbors) {
  const world = next ? worldOf(next.slug) : undefined;
  const style = world
    ? ({ "--next-wash": world.wash, "--next-accent": world.accent } as CSSProperties)
    : undefined;
  return (
    <footer className="case-next" style={style}>
      <Container className="case-next-grid">
        <div className="case-next-lead">
          <p className="case-next-label">{next ? "Continue exploring" : "Back to the start"}</p>
          {next ? (
            <Link
              href={next.href}
              variant="standalone"
              className="case-next-link"
              aria-label={`Next project: ${next.title}`}
            >
              <span>{next.title}</span>
              <Arrow />
            </Link>
          ) : null}
        </div>
        <div className="case-next-side">
          {next ? <p>Next: {next.summary}</p> : null}
          {previous ? (
            <nav aria-label="Project navigation">
              <Link
                href={previous.href}
                variant="standalone"
                className="case-next-previous"
                aria-label={`Previous project: ${previous.title}`}
              >
                <span>Previous</span> {previous.title}
              </Link>
            </nav>
          ) : null}
          <nav aria-label="More work and contact" className="case-next-links">
            <Link href="/work" variant="standalone" className="inline-flex min-h-11 items-center">
              Back to Work
            </Link>
            <Link
              href="/#contact"
              variant="standalone"
              className="inline-flex min-h-11 items-center"
            >
              Contact
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
