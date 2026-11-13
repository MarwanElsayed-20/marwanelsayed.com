import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { Card, CardLink } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/page-header";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

export default function DetailComposition() {
  return (
    <>
      <PlaceholderNotice />
      <PageHeader
        width="reading"
        eyebrow="Category"
        title="Detail page title"
        intro="A long-form page with a comfortable reading width."
      />
      <Container width="reading" className="pb-section">
        <Card className="mb-10">
          <Heading level={2} size="h4">
            Facts
          </Heading>
          <dl className="grid grid-cols-2 gap-2 text-small text-foreground">
            <dt className="text-muted">Category</dt>
            <dd>Placeholder</dd>
            <dt className="text-muted">Format</dt>
            <dd>Placeholder</dd>
          </dl>
        </Card>
        <Prose>
          <p>
            This paragraph shows how long-form text reads. Line length, spacing, and the serif and
            sans pairing are set by the shared system.
          </p>
          <h2>A second-level heading</h2>
          <p>More body text follows the heading with a steady vertical rhythm.</p>
          <ul>
            <li>A first point in a list</li>
            <li>A second point in a list</li>
          </ul>
          <blockquote>A pull quote stands out with the serif face and a strong rule.</blockquote>
          <h3>A third-level heading</h3>
          <p>The article ends with a final paragraph of placeholder text.</p>
        </Prose>
      </Container>
      <Section tone="subtle" heading="Related" headingLevel={2}>
        <Grid columns={2} as="ul">
          {[1, 2].map((n) => (
            <li key={n}>
              <CardLink
                href="/design-system/compositions/listing"
                title={`Related title ${n}`}
                description="Short description of a related item."
                label="Category"
                className="h-full"
              />
            </li>
          ))}
        </Grid>
      </Section>
    </>
  );
}
