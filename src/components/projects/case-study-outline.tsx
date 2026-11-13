import type { CaseStudySection } from "@/lib/projects/case-study";
import { CaseStudyOutlineActive } from "./case-study-outline-active";
import { Container } from "@/components/ui/container";

/**
 * The page's chapters as a numbered strip under the hero, so a long
 * case study can be entered at any part. The current chapter is marked as you scroll.
 */
export function CaseStudyOutline({
  sections,
}: {
  sections: readonly Pick<CaseStudySection, "id" | "title">[];
}) {
  if (!sections.length) return null;
  const list = (
    <ul className="case-outline-list">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="lime-sweep inline-flex min-h-11 items-center rounded-sm underline-offset-4 aria-[current=location]:underline"
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <aside className="case-outline" data-case-study-outline>
      <Container>
        <nav aria-label="On this page" className="hidden py-2 lg:flex lg:items-center lg:gap-10">
          <p className="case-outline-title">On this page</p>
          {list}
        </nav>
        <details className="case-outline-details lg:hidden">
          <summary className="min-h-11 cursor-pointer py-3 text-label font-medium">
            On this page
          </summary>
          <nav aria-label="On this page" className="pb-3">
            {list}
          </nav>
        </details>
      </Container>
      <CaseStudyOutlineActive ids={sections.map((section) => section.id)} />
    </aside>
  );
}
