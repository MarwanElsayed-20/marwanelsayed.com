import { Label } from "@/components/ui/label";
import { SAMPLE_LABEL } from "@/lib/projects/sample";

/** Shown on every card and page that renders sample content, so nobody mistakes it for real work. */
export function SampleLabel() {
  return <Label className="self-start">{SAMPLE_LABEL}</Label>;
}
