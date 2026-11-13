import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { selectedWorkContent } from "@/content/site/selected-work";
import type { ResolvedScene } from "@/lib/projects/selected-work";
import { WorkIntroArt } from "./work-intro-art";
import { WorkStage } from "./work-stage";

/**
 * The home page's work: an intro with its artwork, then one scene per project in that project's
 * own colours. The complete list lives at /work.
 */
export function SelectedWork({ scenes }: { scenes: readonly ResolvedScene[] }) {
  return (
    <section
      id="selected-work"
      tabIndex={-1}
      aria-labelledby="selected-work-heading"
      className="focus:outline-none"
    >
      <Container className="grid items-end gap-x-10 gap-y-10 py-[clamp(3rem,8vh,7rem)] lg:min-h-[min(88svh,64rem)] lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5 lg:pb-[4%]">
          <h2
            id="selected-work-heading"
            className="text-[clamp(3rem,1.4rem+4.6vw,7.25rem)] leading-[0.95] font-light tracking-[-0.04em] whitespace-nowrap text-foreground"
          >
            <SplitWords text={selectedWorkContent.heading} />
          </h2>
          <p
            data-reveal="fade"
            data-reveal-delay="0.2"
            className="max-w-[34ch] text-lead text-muted"
          >
            {selectedWorkContent.introduction}
          </p>
          <div data-reveal="fade" data-reveal-delay="0.2" className="mt-2">
            <ButtonLink href={selectedWorkContent.action.href}>
              {selectedWorkContent.action.label}
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <WorkIntroArt scenes={scenes} />
        </div>
      </Container>
      <WorkStage scenes={scenes} />
    </section>
  );
}
