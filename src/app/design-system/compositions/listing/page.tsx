import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { CardLink } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Grid } from "@/components/ui/grid";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";

const items = [1, 2, 3, 4, 5, 6];

export default function ListingComposition() {
  return (
    <>
      <PlaceholderNotice />
      <PageHeader
        eyebrow="Listing"
        title="Listing page title"
        intro="A grid of cards with a title, a short description, and a category label."
      />
      <Container>
        <div className="flex flex-wrap gap-2 pb-8">
          <Label>All</Label>
          <Label>Category one</Label>
          <Label>Category two</Label>
        </div>
      </Container>
      <Section heading="Items">
        <Grid as="ul">
          {items.map((n) => (
            <li key={n}>
              <CardLink
                href="/design-system/compositions/detail"
                title={`Project title ${n}`}
                description="Short description of the project."
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
