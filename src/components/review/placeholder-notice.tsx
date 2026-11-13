import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

/** Shown at the top of every review page so nobody mistakes it for real content. */
export function PlaceholderNotice() {
  return (
    <div className="pt-6">
      <Container>
        <div className="rounded-md border border-border-strong bg-surface-subtle px-4 py-3">
          <Text variant="small">
            Placeholder content. This is an internal review page for the design system; it is not
            part of the public site.
          </Text>
        </div>
      </Container>
    </div>
  );
}
