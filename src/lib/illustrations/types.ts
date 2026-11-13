import type { ImageKind } from "../projects/types";
export type FactSource = string;
export type IllustrationFacts = {
  slug: string;
  kind: ImageKind;
  method: { reason: string; sources: FactSource[] };
  layout: "orders-table" | "erp-pos" | "services-home" | "catalog-grid" | "analytics-tiles";
  palette: { role: "accent" | "ink" | "surface"; hex: string; source: FactSource }[];
  type: { family: string; status: "reproduced" | "not-reproduced"; source: FactSource };
  screenName: string;
  texts: { text: string; role: "name" | "nav" | "heading"; source: FactSource }[];
  sampleContent: "bars-only";
};
