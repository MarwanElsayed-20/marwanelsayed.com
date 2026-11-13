import { CardLink } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Grid } from "@/components/ui/grid";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { sectionHomeHref } from "@/lib/projects/select";
import type { AboutContent } from "@/content/site/types";

const areas = [digitalExperiences, digitalProducts] as const;

function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((paragraph, index) => (
        <Text key={index}>{paragraph}</Text>
      ))}
    </div>
  );
}

type AboutViewProps = {
  /** Content that counts as supplied: `introduction` has at least one paragraph. */
  content: AboutContent;
};

/** The supplied About section. Optional parts are omitted entirely when they have no paragraphs. */
export function AboutView({ content }: AboutViewProps) {
  const [lead, ...rest] = content.introduction;
  return (
    <Section id="about" tabIndex={-1} heading="About" intro={lead}>
      {rest.length > 0 ? (
        <Section width="reading">
          <Paragraphs items={rest} />
        </Section>
      ) : null}
      <Section headingLevel={3} heading="Areas of work">
        <Grid columns={2} as="ul">
          {areas.map((area) => (
            <li key={area.id}>
              <CardLink
                headingLevel={4}
                href={sectionHomeHref()}
                title={area.name}
                description={area.intro}
              />
            </li>
          ))}
        </Grid>
      </Section>
      {content.approach.length > 0 ? (
        <Section headingLevel={3} heading="Approach" width="reading">
          <Paragraphs items={content.approach} />
        </Section>
      ) : null}
      {content.background.length > 0 ? (
        <Section headingLevel={3} heading="Background" width="reading">
          <Paragraphs items={content.background} />
        </Section>
      ) : null}
      <Section tone="subtle">
        <ButtonLink href="/#contact">Contact</ButtonLink>
      </Section>
    </Section>
  );
}
