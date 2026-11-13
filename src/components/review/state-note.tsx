import { Text } from "@/components/ui/text";

type StateNoteProps = {
  states: readonly string[];
};

/** Lists the states a demonstrated component supports. Hover, press, and Tab to see them. */
export function StateNote({ states }: StateNoteProps) {
  return (
    <Text variant="small">
      States: {states.join(", ")}. Hover, press, or move focus with Tab to see them on the live
      sample.
    </Text>
  );
}
