import { Container, type ContainerWidth } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

type PageHeaderProps = {
  /** Renders the page's single <h1>. */
  title: string;
  eyebrow?: string;
  intro?: string;
  width?: ContainerWidth;
};

export function PageHeader({ title, eyebrow, intro, width = "page" }: PageHeaderProps) {
  return (
    <div className="pt-section pb-10">
      <Container width={width}>
        <div className="flex flex-col gap-4">
          {eyebrow ? (
            <Label tone="accent" className="self-start">
              {eyebrow}
            </Label>
          ) : null}
          <Heading level={1} size="display">
            {title}
          </Heading>
          {intro ? (
            <Text variant="lead" className="max-w-reading">
              {intro}
            </Text>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
