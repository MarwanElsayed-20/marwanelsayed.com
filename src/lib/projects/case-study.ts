import type { ProductProject, Project, ProjectImage, SectionId } from "./types";

export type CaseStudySection = {
  id: "overview" | "walkthrough" | "features" | "architecture" | "technologies";
  title: string;
  /** The small line above the title ("Context / scope"). */
  label: string;
  paragraphs: readonly string[];
  items: readonly string[];
  groups: readonly { title: string; points: readonly string[] }[];
  decisions: readonly { title: string; detail: string }[];
  screens: readonly ProjectImage[];
  responsive: readonly ProjectImage[];
};

const labels: Record<CaseStudySection["id"], string> = {
  overview: "Context / scope",
  walkthrough: "Interface / screens",
  features: "Behaviour / flows",
  architecture: "Engineering / decisions",
  technologies: "Stack / tools",
};

const clean = (values?: readonly string[]) =>
  (values ?? []).map((value) => value.trim()).filter(Boolean);

/** Normalize existing text without inventing content. Empty sections never reach the outline. */
export function buildSections(
  record: Project | ProductProject,
  kind: SectionId,
): CaseStudySection[] {
  const experience = record as Project;
  const product = record as ProductProject;
  const isProduct = kind === "digital-products";
  const sections: CaseStudySection[] = [];
  const add = (id: CaseStudySection["id"], title: string, content: Partial<CaseStudySection>) => {
    const section: CaseStudySection = {
      id,
      title,
      label: labels[id],
      paragraphs: [],
      items: [],
      groups: [],
      decisions: [],
      screens: [],
      responsive: [],
      ...content,
    };
    if (
      section.paragraphs.length ||
      section.items.length ||
      section.groups.length ||
      section.decisions.length ||
      section.screens.length ||
      section.responsive.length
    )
      sections.push(section);
  };
  add("overview", "Overview and scope", {
    paragraphs: isProduct
      ? [
          ...clean(product.productContext),
          ...clean(product.usersAndProblems),
          ...clean(record.role),
        ]
      : [...clean(experience.context), ...clean(record.role)],
    items: clean(record.outcomes),
  });
  add("walkthrough", "Walkthrough", {
    screens: (record.screens ?? []).filter((screen) => !screen.view || screen.view === "desktop"),
    responsive: (record.screens ?? []).filter((screen) => screen.view && screen.view !== "desktop"),
  });
  const groups = (record.features ?? [])
    .map((group) => ({
      title: group.title.trim(),
      points: clean(group.points),
    }))
    .filter((group) => group.title && group.points.length);
  const workflows = isProduct ? clean(product.workflows) : [];
  add("features", "Features and flows", { groups, paragraphs: workflows });
  add("architecture", "Architecture and decisions", {
    paragraphs: clean(isProduct ? product.designDecisions : experience.approach),
    decisions: (record.decisions ?? [])
      .map((decision) => ({
        title: decision.title.trim(),
        detail: decision.detail.trim(),
      }))
      .filter((decision) => decision.title && decision.detail),
  });
  add("technologies", "Technologies", { items: clean(record.builtWith) });
  return sections;
}
