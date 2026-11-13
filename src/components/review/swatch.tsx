import { Text } from "@/components/ui/text";

type SwatchProps = {
  /** Color token name without the `color-` prefix. */
  token: string;
};

export function Swatch({ token }: SwatchProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-md border border-border"
        style={{ backgroundColor: `var(--color-${token})` }}
        aria-hidden="true"
      />
      <Text variant="small" as="span">
        {token}
      </Text>
    </div>
  );
}
