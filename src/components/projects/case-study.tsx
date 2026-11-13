import type { CSSProperties } from "react";
import { ScreenViewerLazy } from "./screen-viewer-lazy";
import { ProductFamily } from "./product-family";
import type { FamilyView } from "@/lib/projects/families";
import { CaseStudyNeighbors } from "./case-study-neighbors";
import { CaseStudyOutline } from "./case-study-outline";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { SplitWords } from "@/components/ui/split-words";
import { SampleLabel } from "./sample-label";
import { PreviewFrame } from "./preview-frame";
import { cleaned } from "./detail-parts";
import { defaultRole, rowRoles } from "@/content/site/work-page";
import type { ProjectImage } from "@/lib/projects/types";
import { buildSections, type CaseStudySection } from "@/lib/projects/case-study";
import { progressLabels } from "@/lib/projects/progress";
import type { ProductProject, Project, SectionId } from "@/lib/projects/types";
import type { WorkNeighbors } from "@/lib/projects/work";
import { sceneVars, worldOf } from "@/lib/work-world";

/** The page's one note about the screens, under the hero capture; captions stay plain. */
export const CAPTURE_NOTE = "Screens use sample data to protect client information.";

export type CaseStudyProps = {
  project: Project | ProductProject;
  kind: SectionId;
  category: string;
  productLabel?: string;
  neighbors?: WorkNeighbors;
  family?: FamilyView;
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * The delay a section waits before it rises: 0, 0.045s or 0.09s by position
 * (`0.045 * min(i % 3, 2)`), so neighbours rise one after the other rather than together.
 */
const delayOf = (index: number) => (0.045 * Math.min(index % 3, 2)).toFixed(3);

function Screens({ images }: { images: readonly ProjectImage[] }) {
  return (
    <ol className="flex flex-col gap-10">
      {images.map((image, index) => (
        <li key={`${image.src}-${index}`}>
          <figure className="flex flex-col gap-3">
            <PreviewFrame
              image={{
                ...image,
                decorative: undefined,
                alt: image.alt ?? image.caption ?? `Screen ${index + 1}`,
              }}
              title={`Screen ${index + 1}`}
              aspect="native"
              sizes="(min-width: 1024px) 70vw, 100vw"
            />
            <figcaption className="text-small text-muted">
              {image.caption ?? image.alt ?? `Screen ${index + 1}`}
            </figcaption>
          </figure>
        </li>
      ))}
    </ol>
  );
}

function InteractiveScreens({
  images,
  title,
  label,
}: {
  images: readonly ProjectImage[];
  title: string;
  label: string;
}) {
  return (
    <>
      <ScreenViewerLazy screens={images} title={title} label={label} />
      <noscript>
        <style>{"[data-screen-viewer] { display: none !important; }"}</style>
        <Screens images={images} />
      </noscript>
    </>
  );
}

/** A numbered list with a hairline between its items (results). */
function Register({ items }: { items: readonly string[] }) {
  return (
    <ol className="case-register">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

/** What a chapter holds: copy, then the lists and groups. */
function Chapter({ section, project }: { section: CaseStudySection; project: string }) {
  const [first, ...rest] = section.paragraphs;
  const overview = section.id === "overview";
  let step = 0;
  const next = () => delayOf(step++);
  const copy = section.paragraphs.length ? (
    <div className="case-copy" data-reveal="scene" data-reveal-delay={next()}>
      {section.id === "overview" || section.id === "architecture" ? (
        <>
          <p className="case-lead">{first}</p>
          {rest.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </>
      ) : (
        section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
      )}
    </div>
  ) : null;
  return (
    <>
      {section.screens.length ? (
        <div className="case-plate" data-reveal="scene" data-reveal-delay={next()}>
          <InteractiveScreens images={section.screens} title={project} label="Walkthrough" />
        </div>
      ) : null}
      {section.responsive.length ? (
        <div className="case-responsive" data-reveal="scene" data-reveal-delay={next()}>
          <h3 className="case-subtitle">Responsive and states</h3>
          <div className="case-plate">
            <InteractiveScreens
              images={section.responsive}
              title={project}
              label="Responsive and states"
            />
          </div>
        </div>
      ) : null}
      {overview && section.items.length ? (
        <div className="case-split">
          {copy}
          <div className="case-aside" data-reveal="scene" data-reveal-delay={next()}>
            <h3 className="case-subtitle">Results</h3>
            <Register items={section.items} />
          </div>
        </div>
      ) : (
        copy
      )}
      {section.id === "technologies" && section.items.length ? (
        <ul className="case-chips" data-reveal="stagger">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.groups.length ? (
        <div className="case-groups" data-reveal="stagger">
          {section.groups.map((group) => (
            <div key={group.title} className="case-group">
              <h3>{group.title}</h3>
              <ul>
                {group.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      {section.decisions.length ? (
        <div className="case-groups case-decisions" data-reveal="stagger">
          {section.decisions.map((decision, i) => (
            <div key={i} className="case-group">
              <h3>{decision.title}</h3>
              <p>{decision.detail}</p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

/** Server-rendered story: the hero is complete even when all optional sections are absent. */
export function CaseStudy({
  project,
  kind,
  category,
  productLabel,
  neighbors,
  family,
}: CaseStudyProps) {
  const sections = buildSections(project, kind);
  const tools = cleaned(project.builtWith);
  const world = worldOf(project.slug);
  const HeroFrame = project.image ? "figure" : "div";
  const facts = [
    ...(project.period?.trim() ? [["Started", project.period.trim()]] : []),
    ...(project.progress ? [["Status", progressLabels[project.progress]]] : []),
    ["Role", rowRoles[project.slug] ?? defaultRole],
    ["Area", category],
    ...(tools.length ? [["Stack", tools.slice(0, 4).join(", ")]] : []),
  ];
  return (
    <article
      className="case-study [overflow-wrap:anywhere]"
      data-case-world={project.slug}
      data-world-tone={world.tone}
      style={sceneVars(world) as CSSProperties}
    >
      <header className="case-hero">
        <Container className="case-hero-grid">
          <Link
            href="/work"
            variant="standalone"
            className="case-back inline-flex min-h-11 w-fit items-center self-start justify-self-start"
          >
            Back to Work
          </Link>
          <div className="case-hero-copy">
            <p className="case-kicker" data-reveal="fade">
              {productLabel ? <span>{productLabel}</span> : null}
              <span>{category}</span>
              {project.sample ? <SampleLabel /> : null}
            </p>
            <h1 className="case-title">
              <SplitWords text={project.title} step={0.045} />
            </h1>
            <p className="case-summary" data-reveal="fade" data-reveal-delay="0.3">
              {project.summary}
            </p>
          </div>
          <div className="case-hero-meta" data-reveal="fade" data-reveal-delay="0.45">
            <dl className="case-facts">
              {facts.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
            {project.scope?.trim() ? (
              <div className="case-contribution">
                <span>What I implemented</span>
                <p>{project.scope.trim()}</p>
              </div>
            ) : null}
          </div>
          <HeroFrame className="case-hero-media" data-reveal={project.image ? "open" : undefined}>
            <PreviewFrame
              title={project.title}
              image={project.image}
              priority
              sizes="(min-width: 72rem) 56vw, 100vw"
            />
            {project.image ? (
              <figcaption>
                {project.image.kind === "capture"
                  ? CAPTURE_NOTE
                  : (project.image.caption ?? project.image.alt ?? project.title)}
              </figcaption>
            ) : null}
          </HeroFrame>
        </Container>
      </header>
      <CaseStudyOutline sections={sections} />
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="case-scene"
          data-tone={section.screens.length || section.responsive.length ? "dark" : "light"}
        >
          <Container>
            <div className="case-chapter" data-reveal="scene">
              <span aria-hidden="true" className="case-chapter-no">
                {pad(index + 1)}
              </span>
              <p className="case-chapter-label">{section.label}</p>
              <h2 id={`${section.id}-heading`} className="case-chapter-title">
                {section.title}
              </h2>
            </div>
            <div className="case-body">
              <Chapter section={section} project={project.title} />
            </div>
          </Container>
        </section>
      ))}
      <ProductFamily family={family} number={pad(sections.length + 1)} />
      <CaseStudyNeighbors {...neighbors} />
    </article>
  );
}
