import { WorkIndex } from "@/components/site/work-index";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { families } from "@/content/projects/families";
import { compactWork, productLabels, workOrder } from "@/content/projects/work-order";
import { defaultRole, rowRoles, workPage } from "@/content/site/work-page";
import { productProjects, projects } from "@/lib/projects/repository";
import { buildWorkEntries } from "@/lib/projects/work";
import { buildWorkRows } from "@/lib/projects/work-rows";
import { metadataFor } from "@/lib/site-pages";

export const metadata = metadataFor("work");

export default function WorkPage() {
  const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
  const rows = buildWorkRows(entries, families, {
    roles: rowRoles,
    defaultRole,
    sectionOrder: ["digital-products", "digital-experiences"],
    compact: compactWork,
  });
  return (
    <section
      id="work"
      tabIndex={-1}
      aria-labelledby="work-title"
      className="pt-[clamp(2.5rem,7vw,8rem)] pb-section focus:outline-none"
    >
      <noscript>
        <style>
          {
            "@layer base{[data-work-entry][hidden]{display:grid!important}}[data-work-controls]{display:none!important}"
          }
        </style>
      </noscript>
      <Container>
        <header className="mb-[clamp(3.5rem,6vw,5.5rem)] grid items-center gap-[clamp(2.5rem,6vw,5.5rem)] lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
          <div className="flex flex-col gap-6">
            <p data-reveal="fade" className="text-label tracking-widest text-muted uppercase">
              {workPage.label}
            </p>
            <h1
              id="work-title"
              className="text-[clamp(3rem,1.2rem+6.1vw,9rem)] leading-[0.9] font-light tracking-[-0.045em] text-foreground"
            >
              {workPage.heading.map((line, index) => (
                <span key={line} className="block sm:whitespace-nowrap">
                  <SplitWords text={line} delay={index * 0.2} />
                  {index < workPage.heading.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
          </div>
          <p
            data-reveal="fade"
            data-reveal-delay="0.2"
            className="max-w-[36ch] text-lead text-muted lg:justify-self-end"
          >
            {workPage.introduction}
          </p>
        </header>
        <WorkIndex rows={rows} />
      </Container>
    </section>
  );
}
