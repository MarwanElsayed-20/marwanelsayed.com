import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CvButton } from "@/components/ui/cv-button";
import { Logo } from "@/components/ui/logo";
import { SplitWords } from "@/components/ui/split-words";
import { aboutPage } from "@/content/site/about";
import type { AboutContent, ProfileLink } from "@/content/site/types";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import type { AboutLink } from "@/lib/projects/about-links";
import type { TechnologyCount } from "@/lib/projects/technologies";
import { whatsappLabel, whatsappUrl } from "@/lib/site/whatsapp";
import { sectionTitle, ServiceProof } from "./service-parts";

const pad = (value: number) => String(value).padStart(2, "0");

type AboutPageProps = {
  content: AboutContent;
  /** The owner's name: the page's title. */
  name: string;
  /** The role under the name. */
  role: string;
  /** Where the owner is based, in the label above the name. */
  place: string;
  email: string | null;
  profiles: readonly ProfileLink[];
  whatsapp?: string | null;
  /** The case studies that show the current work, in the order they are listed. */
  currentWork: readonly AboutLink[];
  counts: { experiences: number; products: number };
  technologies: readonly TechnologyCount[];
};

const label = "text-label font-semibold tracking-[0.14em] text-foreground uppercase";

/** One numbered band: its label beside a title and what follows it, the rule drawing in above. */
function Band({
  id,
  number,
  name,
  title,
  children,
}: {
  id: string;
  number: number;
  name: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <Container>
        <div
          data-reveal="ledger"
          className="grid gap-x-[clamp(2rem,5vw,6rem)] gap-y-5 py-[clamp(3rem,6vw,6rem)] lg:grid-cols-[minmax(8rem,0.3fr)_minmax(0,1fr)]"
        >
          <p className={`${label} lg:pt-[0.6em]`}>
            {pad(number)} / {name}
          </p>
          <div className="flex flex-col items-start gap-6">
            <h2 id={`${id}-title`} className={`${sectionTitle} max-w-[18ch]`}>
              <SplitWords text={title} />
            </h2>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}

const body = "max-w-[62ch] text-body text-muted";

/**
 * The About page: the name very large beside a portrait, the role, a
 * lead and the ways onward, then numbered bands (a label beside a title and a few lines). It adds
 * the rest of the About content: the two areas, the approach and tools, the roles.
 */
export function AboutPage({
  content,
  name,
  role,
  place,
  email,
  profiles,
  whatsapp = null,
  currentWork,
  counts,
  technologies,
}: AboutPageProps) {
  const [lead, intro] = content.introduction;
  const areas = [
    { area: digitalExperiences, href: "/work#websites-ecommerce", count: counts.experiences },
    { area: digitalProducts, href: "/work#saas-dashboards", count: counts.products },
  ];
  let number = 0;
  return (
    <>
      <section
        aria-labelledby="about-title"
        className="pt-[clamp(2.5rem,7vw,8rem)] pb-[clamp(2rem,5vw,5rem)]"
      >
        <Container>
          <header className="grid items-end gap-x-[clamp(2rem,6vw,7rem)] gap-y-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.72fr)]">
            <div className="flex flex-col items-start">
              <p data-reveal="fade" className={label}>
                About / {place}
              </p>
              <h1
                id="about-title"
                className="mt-4 text-[clamp(3.25rem,0.6rem+9.4vw,10.5rem)] leading-[0.9] font-light tracking-[-0.055em] text-balance text-foreground"
              >
                <SplitWords text={name} step={0.08} />
              </h1>
              <p
                data-reveal="fade"
                data-reveal-delay="0.25"
                className="mt-6 text-[clamp(1.25rem,1rem+1.2vw,2.25rem)] leading-[1.2] font-bold text-foreground"
              >
                {role}
              </p>
              <p
                data-reveal="fade"
                data-reveal-delay="0.35"
                className="mt-8 max-w-[54ch] text-lead text-muted"
              >
                {lead}
              </p>
              <div
                data-reveal="fade"
                data-reveal-delay="0.45"
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <ButtonLink href="/work">{aboutPage.actions.work}</ButtonLink>
                <ButtonLink href="/#contact" variant="secondary">
                  {aboutPage.actions.touch}
                </ButtonLink>
                <CvButton />
              </div>
            </div>
            <figure className="m-0 w-full max-lg:max-w-[32rem]">
              <div
                data-about-portrait
                data-reveal="print"
                data-reveal-arrival
                data-reveal-delay="0.1"
                data-print-frame
                className="relative aspect-square overflow-hidden rounded-xl bg-surface-subtle"
                style={{ "--print-step": "0.1s" } as CSSProperties}
              >
                {/* The mark waits on the frame: the photo wipes in over it, then turns to colour. */}
                <Logo
                  decorative
                  className="absolute inset-0 m-auto h-[42%] w-auto text-foreground"
                />
                <Image
                  data-print-picture
                  src={aboutPage.portrait.src}
                  alt={aboutPage.portrait.alt}
                  width={aboutPage.portrait.width}
                  height={aboutPage.portrait.height}
                  sizes="(max-width: 1023px) 84vw, 34vw"
                  priority
                  className="size-full object-cover object-[50%_28%]"
                />
              </div>
              <figcaption
                data-reveal="fade"
                data-reveal-delay="0.5"
                className="mt-3 text-label tracking-[0.1em] text-muted uppercase"
              >
                {name} / {role} / {place.split(",")[0]}
              </figcaption>
            </figure>
          </header>
        </Container>
      </section>

      <Band
        id="current"
        number={++number}
        name={aboutPage.current.label}
        title={aboutPage.current.title}
      >
        <p className={body}>{aboutPage.current.body}</p>
        {currentWork.length > 0 ? (
          <ServiceProof seen={currentWork} label={aboutPage.current.seenLabel} />
        ) : null}
      </Band>

      <Band id="areas" number={++number} name={aboutPage.areas.label} title={aboutPage.areas.title}>
        {intro ? <p className={body}>{intro}</p> : null}
        <ul data-reveal="ledger" className="w-full">
          {areas.map(({ area, href, count }, index) => (
            <li key={area.id} className="border-b border-border">
              <Link
                href={href}
                className="group grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-baseline"
              >
                <span aria-hidden="true" className="text-small text-muted tabular-nums">
                  {pad(index + 1)}
                </span>
                <span className="flex flex-col gap-2">
                  <span
                    data-sweep-group
                    className="lime-sweep w-fit rounded-sm text-[clamp(1.5rem,1.1rem+1.6vw,2.75rem)] leading-[1.1] font-light tracking-[-0.02em] text-foreground"
                  >
                    {area.name}
                  </span>
                  <span className="max-w-reading text-muted">{area.intro}</span>
                </span>
                <span className="text-small text-muted tabular-nums">{count} case studies</span>
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      {content.approach.length > 0 ? (
        <Band
          id="approach"
          number={++number}
          name={aboutPage.approach.label}
          title={aboutPage.approach.title}
        >
          {content.approach.map((paragraph) => (
            <p key={paragraph} className={body}>
              {paragraph}
            </p>
          ))}
          {technologies.length > 0 ? (
            <div className="flex w-full flex-col gap-4 pt-4">
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className={label}>{aboutPage.approach.toolsLabel}</span>
                <span className="text-small text-muted">{aboutPage.approach.toolsNote}</span>
              </p>
              <ul className="flex flex-wrap gap-3">
                {technologies.map((technology) => (
                  <li
                    key={technology.name}
                    data-reveal="fade"
                    className="flex items-baseline gap-2 rounded-full border border-border-strong px-4 py-2"
                  >
                    <span className="text-foreground">{technology.name}</span>
                    <span className="text-small text-muted tabular-nums">
                      <span className="sr-only">in </span>
                      {technology.count}
                      <span className="sr-only"> projects</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Band>
      ) : null}

      {content.experience?.length || content.background.length > 0 ? (
        <Band
          id="experience"
          number={++number}
          name={aboutPage.experience.label}
          title={aboutPage.experience.title}
        >
          {content.background.map((paragraph) => (
            <p key={paragraph} className={body}>
              {paragraph}
            </p>
          ))}
          {content.experience?.length ? (
            <ol data-reveal="ledger" className="w-full">
              {content.experience.map((entry) => (
                <li
                  key={`${entry.place ?? ""}-${entry.role}-${entry.period ?? ""}`}
                  className="grid gap-x-8 gap-y-2 border-b border-border py-7 md:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <span className="text-small text-muted tabular-nums">
                    {entry.period ?? "Diploma"}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-h3 font-light tracking-[-0.01em] text-foreground">
                      {entry.place ?? entry.role}
                    </h3>
                    {entry.place ? <p className="text-foreground">{entry.role}</p> : null}
                    <p className="max-w-reading text-muted">{entry.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </Band>
      ) : null}

      <Band
        id="profiles"
        number={++number}
        name={aboutPage.profiles.label}
        title={aboutPage.profiles.title}
      >
        <p className={body}>{aboutPage.profiles.body}</p>
        <nav
          aria-label={aboutPage.profiles.label}
          data-reveal="fade"
          className="flex flex-wrap items-center gap-3"
        >
          {email !== null ? (
            <ButtonLink href={`mailto:${email}`} variant="secondary">
              {aboutPage.profiles.emailLabel}
            </ButtonLink>
          ) : null}
          {profiles.map((profile) => (
            <ButtonLink key={profile.url} href={profile.url} external variant="secondary">
              {profile.label}
            </ButtonLink>
          ))}
          {whatsapp ? (
            <ButtonLink href={whatsappUrl(whatsapp)} external variant="secondary">
              {whatsappLabel}
            </ButtonLink>
          ) : null}
        </nav>
      </Band>
    </>
  );
}
