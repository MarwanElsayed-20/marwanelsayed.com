import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const features = [1, 2, 3];

export default function LandingComposition() {
  return (
    <>
      <PlaceholderNotice />
      <PageHeader
        eyebrow="Category"
        title="Landing page title"
        intro="A short introduction that explains what this page is about in one or two sentences."
      />
      <Section heading="Section heading" intro="Short supporting text for this section.">
        <Grid as="ul">
          {features.map((n) => (
            <li key={n}>
              <Card className="h-full">
                <Label className="self-start">Feature</Label>
                <Heading level={3} size="h3">
                  Feature title {n}
                </Heading>
                <Text variant="muted">
                  A short description that shows how a feature block reads.
                </Text>
              </Card>
            </li>
          ))}
        </Grid>
      </Section>
      <Section
        tone="subtle"
        heading="Call to action"
        intro="A closing section with a clear next step."
      >
        <div className="flex flex-wrap gap-4">
          <ButtonLink href="/design-system/compositions/listing">Primary action</ButtonLink>
          <ButtonLink href="/design-system" variant="secondary">
            Secondary action
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
