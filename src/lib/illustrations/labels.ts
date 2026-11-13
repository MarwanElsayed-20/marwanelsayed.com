import type { ImageKind } from "@/lib/projects/types";
export const IMAGE_KIND_LABEL: Record<ImageKind, string> = {
  illustration: "Illustration",
  reconstruction: "Reconstruction",
  capture: "Real interface, sample data",
};
export const CAPTION: Record<ImageKind, string> = {
  illustration: "Illustration based on the project's interface; not a screenshot.",
  reconstruction: "Reconstruction of the project's interface with sample data; not a screenshot.",
  capture: "Real interface rendered from the project's code with sample data.",
};
