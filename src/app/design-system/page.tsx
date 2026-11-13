import { ContrastList } from "@/components/review/contrast-list";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { StateNote } from "@/components/review/state-note";
import { Swatch } from "@/components/review/swatch";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardLink } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/ui/page-header";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";

const colorTokens = [
  "background",
  "surface",
  "surface-subtle",
  "foreground",
  "muted",
  "accent",
  "accent-strong",
  "border",
  "border-strong",
  "focus",
  "disabled",
];

const radii = ["sm", "md", "lg"] as const;
const radiusClass = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" } as const;

export default function StyleGuidePage() {
  return (
    <>
      <PlaceholderNotice />
      <PageHeader
        eyebrow="Internal review"
        title="Design system"
        intro="Tokens, type, spacing, and every shared component with its variants and states."
      />

      <Section
        heading="Color"
        intro="Warm paper neutrals, near-black ink, one accent, and a separate focus color."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {colorTokens.map((token) => (
            <Swatch key={token} token={token} />
          ))}
        </div>
        <Heading level={3} className="mt-12 mb-4">
          Contrast ratios
        </Heading>
        <ContrastList />
      </Section>

      <Section
        tone="subtle"
        heading="Typography"
        intro="Serif for display and headings, sans for body and interface text."
      >
        <div className="flex flex-col gap-6">
          <Heading level={3} size="display">
            Display
          </Heading>
          <Heading level={3} size="h1">
            Heading 1 style
          </Heading>
          <Heading level={3} size="h2">
            Heading 2 style
          </Heading>
          <Heading level={3} size="h3">
            Heading 3 style
          </Heading>
          <Heading level={3} size="h4">
            Heading 4 style
          </Heading>
          <Text variant="lead">Lead text introduces a section in a larger size.</Text>
          <Text>Body text is set for comfortable reading at a steady line length.</Text>
          <Text variant="muted">Muted body text is used for secondary information.</Text>
          <Text variant="small">Small text is used for captions and notes.</Text>
          <div>
            <Label>Label</Label>
          </div>
        </div>
        <Heading level={3} className="mt-12 mb-4">
          Long-form content
        </Heading>
        <Prose>
          <p>Paragraphs keep a steady rhythm and a comfortable measure.</p>
          <h2>A second-level heading</h2>
          <p>
            Text can include an <a href="#top">inline link</a> and <code>inline code</code>.
          </p>
          <ul>
            <li>First list item</li>
            <li>Second list item</li>
          </ul>
          <blockquote>A pull quote uses the serif face with a strong left rule.</blockquote>
        </Prose>
      </Section>

      <Section heading="Spacing, widths, and radii">
        <div className="flex flex-col gap-8">
          <div>
            <Heading level={3} size="h4" className="mb-3">
              Rhythm
            </Heading>
            <div className="flex flex-col gap-2">
              <Text variant="small">Stack gap</Text>
              <div
                className="w-full max-w-reading bg-surface-subtle"
                style={{ height: "var(--spacing-stack)" }}
              />
              <Text variant="small">Page gutter</Text>
              <div
                className="bg-surface-subtle"
                style={{ height: "1rem", width: "var(--spacing-gutter)" }}
              />
              <Text variant="small">Section padding</Text>
              <div
                className="bg-surface-subtle"
                style={{ height: "var(--spacing-section)", width: "1rem" }}
              />
            </div>
          </div>
          <div>
            <Heading level={3} size="h4" className="mb-3">
              Content widths
            </Heading>
            <div className="flex flex-col gap-2">
              {(["reading", "page", "wide"] as const).map((name) => (
                <div key={name} className="flex flex-col gap-1">
                  <Text variant="small">{name}</Text>
                  <div
                    className="h-3 bg-surface-subtle"
                    style={{ width: `min(100%, var(--container-${name}))` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Heading level={3} size="h4" className="mb-3">
              Borders and radii
            </Heading>
            <div className="flex flex-wrap gap-4">
              {radii.map((name) => (
                <div
                  key={name}
                  className={`flex h-20 w-28 items-center justify-center border border-border-strong bg-surface ${radiusClass[name]}`}
                >
                  <Text variant="small" as="span">
                    radius {name}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="subtle"
        heading="Motion"
        intro="Short CSS transitions only, disabled when reduced motion is requested."
      >
        <ul className="flex flex-col gap-1">
          <li>
            <Text variant="small">fast: 150 ms, used for color and border changes</Text>
          </li>
          <li>
            <Text variant="small">base: 250 ms, reserved for larger transitions</Text>
          </li>
          <li>
            <Text variant="small">easing: standard curve</Text>
          </li>
        </ul>
      </Section>

      <Section
        heading="Components"
        intro="Every sample below is live. Hover, press, and tab to inspect states."
      >
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Heading level={3} size="h4">
              Button
            </Heading>
            <div className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="quiet">Quiet</Button>
              <Button disabled>Disabled primary</Button>
              <Button variant="secondary" disabled>
                Disabled secondary
              </Button>
              <Button variant="quiet" disabled>
                Disabled quiet
              </Button>
            </div>
            <StateNote states={["default", "hover", "focus-visible", "active", "disabled"]} />
          </div>

          <div className="flex flex-col gap-4">
            <Heading level={3} size="h4">
              Button link
            </Heading>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/design-system">Primary link</ButtonLink>
              <ButtonLink href="/design-system" variant="secondary">
                Secondary link
              </ButtonLink>
              <ButtonLink href="/design-system" variant="quiet">
                Quiet link
              </ButtonLink>
            </div>
            <StateNote states={["default", "hover", "focus-visible", "active"]} />
          </div>

          <div className="flex flex-col gap-4">
            <Heading level={3} size="h4">
              Link
            </Heading>
            <Text>
              An <Link href="/design-system">inline link</Link> sits inside text, and an{" "}
              <Link href="https://example.com">external link</Link> opens in a new tab.
            </Text>
            <div>
              <Link href="/design-system" variant="standalone">
                Standalone link
              </Link>
            </div>
            <StateNote states={["default", "hover", "focus-visible", "active"]} />
          </div>

          <div className="flex flex-col gap-4">
            <Heading level={3} size="h4">
              Label
            </Heading>
            <div className="flex flex-wrap gap-4">
              <Label>Neutral</Label>
              <Label tone="accent">Accent</Label>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Heading level={3} size="h4">
              Card and card link
            </Heading>
            <Grid columns={2}>
              <Card>
                <Label className="self-start">Category</Label>
                <Heading level={4}>Static card</Heading>
                <Text variant="muted">A static surface with no hover behavior.</Text>
              </Card>
              <CardLink
                href="/design-system"
                title="Interactive card"
                description="One link target covers the whole card."
                label="Category"
                headingLevel={4}
              />
            </Grid>
            <StateNote states={["default", "hover", "focus-visible", "active"]} />
          </div>
        </div>
      </Section>
    </>
  );
}
