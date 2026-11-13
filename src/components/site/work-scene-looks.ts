import type { SceneTone } from "@/lib/contrast";

/**
 * Where the text and the artwork sit, in four scenes: side (text left, art
 * right), corner (text top left, art large at the bottom right), stage (a two-column header on
 * top, the artwork filling the rest and the space beside it) and offset (text in from the left,
 * art right).
 */
export type SceneLayout = "side" | "corner" | "stage" | "offset";

/**
 * Grid placement on wide screens; narrow screens stack text then art. `parts` places the label,
 * title, summary and links inside the text block (the stage layout sets them as a two-column
 * header so the band of art below gets the height).
 */
export const sceneLayouts: Record<
  SceneLayout,
  {
    text: string;
    art: string;
    parts?: { label: string; title: string; summary: string; links: string };
  }
> = {
  side: {
    text: "lg:col-start-1 lg:col-span-5 lg:row-start-1 lg:row-span-2 lg:self-center",
    art: "lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-span-2",
  },
  corner: {
    text: "lg:col-start-1 lg:col-span-5 lg:row-start-1 lg:self-start",
    art: "lg:col-start-5 lg:col-end-13 lg:row-span-2 lg:row-start-1",
  },
  stage: {
    text: "lg:col-start-1 lg:col-end-13 lg:row-start-1 lg:grid lg:grid-cols-[auto_minmax(0,34ch)] lg:items-end lg:justify-start lg:gap-x-[6vw] lg:pb-[clamp(1rem,2vw,2rem)]",
    art: "lg:col-start-1 lg:col-end-13 lg:row-start-1 lg:row-span-2",
    parts: {
      label: "lg:col-start-1",
      title: "lg:col-start-1",
      summary: "lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-end",
      links: "lg:col-start-2",
    },
  },
  offset: {
    text: "lg:col-start-2 lg:col-span-4 lg:row-start-1 lg:row-span-2 lg:self-center",
    art: "lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-span-2",
  },
};

export type SceneLook = {
  /** Dark scenes colour the title with the accent and use light ink for the cursor. */
  dark: boolean;
  layout: SceneLayout;
};

/** Each scene's surface and layout; its artwork lives in scene-art/. */
export const sceneLooks: Record<SceneTone, SceneLook> = {
  toolswift: { dark: true, layout: "side" },
  "smooth-erp": { dark: false, layout: "corner" },
  aligna: { dark: false, layout: "stage" },
  wajihni: { dark: true, layout: "offset" },
};
