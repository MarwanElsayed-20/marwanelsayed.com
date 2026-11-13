import type { WorkFilter } from "../../lib/projects/filter";

/**
 * The Work page's own words. Nothing here is a claim the project records
 * do not make, and nothing says this is everything: it names the kinds
 * of work, and each row opens its case study.
 */
export const workPage = {
  label: "Case studies",
  /** One line per entry, set large. */
  heading: ["Products, stores", "and dashboards."],
  introduction:
    "Websites, online stores, SaaS products and dashboards I have built. Open any of them for the case study. Images are captures of the real interfaces with sample data.",
  filtersLabel: "Filter work",
  open: "Open case study",
  /** Above the compact rows at the end of Websites & E-commerce. */
  more: "More online stores",
} as const;

export const workFilters: readonly { value: WorkFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "websites-ecommerce", label: "Websites & E-commerce" },
  { value: "saas-dashboards", label: "SaaS & Dashboards" },
];

export type WorkArea = {
  /** The project section it stands for: "digital-products" or "digital-experiences". */
  id: string;
  title: string;
  description: string;
};

/** The two areas of work, in the order the rows follow: ToolSwift, which opens the list, is a product. */
export const workAreas: readonly WorkArea[] = [
  {
    id: "digital-products",
    title: "SaaS & Dashboards",
    description: "Products, platforms and the dashboards behind them.",
  },
  {
    id: "digital-experiences",
    title: "Websites & E-commerce",
    description: "Online stores, landing pages and websites.",
  },
];

/** The role held on a project, where it was not the usual one. Everything else is the default. */
export const defaultRole = "Front-end developer";
export const rowRoles: Readonly<Record<string, string>> = {
  wajihni: "Full-stack developer",
  "smooth-erp": "Front-end lead",
};

export type AreaSpan = WorkArea & { start: number; end: number };

/**
 * Each area with the 1-based numbers of the rows it holds ("01–11"). `rowAreas` is the area of each
 * row in order; it must already be grouped, so a row out of place fails loudly.
 */
export function areaSpans(areas: readonly WorkArea[], rowAreas: readonly string[]): AreaSpan[] {
  const spans = areas.map((area) => {
    const first = rowAreas.indexOf(area.id);
    const last = rowAreas.lastIndexOf(area.id);
    if (first < 0) throw new Error(`No rows in area: ${area.id}`);
    if (rowAreas.slice(first, last + 1).some((id) => id !== area.id))
      throw new Error(`Rows of area ${area.id} are not together`);
    return { ...area, start: first + 1, end: last + 1 };
  });
  if (spans.reduce((sum, span) => sum + (span.end - span.start + 1), 0) !== rowAreas.length)
    throw new Error("A row belongs to no area");
  return spans;
}

export const range = (span: Pick<AreaSpan, "start" | "end">) =>
  `${String(span.start).padStart(2, "0")}–${String(span.end).padStart(2, "0")}`;
