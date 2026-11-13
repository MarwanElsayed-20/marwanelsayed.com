import { HeroStage } from "@/components/hero/hero-stage";
import { techLogos } from "@/components/hero/tech-logos";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CvButton } from "@/components/ui/cv-button";
import { SplitWords } from "@/components/ui/split-words";
import { site, siteDescription } from "@/config/site";
import { siteContent } from "@/lib/site-content";

/**
 * Hero copy. The introduction comes from src/content/site/home.ts (the owner supplies it) and
 * falls back to the neutral site description. No scene code needs to change.
 */
export const heroContent = {
  name: site.name,
  role: siteContent.home.headline,
  intro: siteContent.home.introduction ?? siteDescription,
} as const;

/** The static (no WebGL) panel shows the first few logos; the 3D scene cycles through them all. */
const fallbackIcons = techLogos.slice(0, 8).map(({ title, viewBox, markup }) => ({
  name: title,
  viewBox,
  markup,
}));

export function Hero() {
  const nameWords = heroContent.name.split(" ").length;
  return (
    <section aria-labelledby="hero-heading" className="pb-14 lg:pb-20">
      <Container className="flex h-[calc(100svh-var(--header-height))] min-h-[28rem] flex-col gap-y-6 pt-6 pb-[max(0.5rem,0.7vw)] lg:pt-[1.5vw]">
        <div className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-[clamp(1rem,2.4svh,1.75rem)]">
          <h1
            id="hero-heading"
            className="text-[clamp(2rem,min(1.5rem+4vw,10svh),6.5rem)] leading-[1.05] tracking-tight text-balance text-foreground lg:col-span-8 lg:row-span-2 lg:row-start-1"
          >
            <span className="block font-light">
              <SplitWords text={heroContent.name} delay={0.1} />
            </span>{" "}
            <span className="block font-bold">
              <SplitWords text={heroContent.role} delay={0.1 + nameWords * 0.05} />
            </span>
          </h1>
          <p
            data-reveal="fade"
            data-reveal-delay="0.45"
            className="max-w-reading text-[clamp(1.0625rem,min(0.9rem+0.95vw,3.4svh),1.875rem)] leading-[1.45] text-foreground [overflow-wrap:anywhere] lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:pt-3"
          >
            {heroContent.intro}
          </p>
          <div
            data-reveal="fade"
            data-reveal-delay="0.55"
            data-hero-actions
            className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:col-start-9 lg:row-start-2"
          >
            <ButtonLink href="/about">About me</ButtonLink>
            <CvButton />
          </div>
        </div>
        <div data-reveal="fade" data-reveal-delay="0.35" className="flex min-h-0 flex-1 flex-col">
          <HeroStage icons={fallbackIcons} />
        </div>
      </Container>
    </section>
  );
}
