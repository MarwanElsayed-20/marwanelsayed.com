import type { FamilyView } from "@/lib/projects/families";
import { CaseStudy } from "./case-study";
import type { Project, ProjectCategory, ProjectSection } from "@/lib/projects/types";
import type { WorkNeighbors } from "@/lib/projects/work";

type Props = {
  section: ProjectSection;
  project: Project;
  category: ProjectCategory;
  /** Retained for review route compatibility; all case studies return to Work. */
  backHref: string;
  productLabel?: string;
  neighbors?: WorkNeighbors;
  family?: FamilyView;
};

export function ProjectDetail({ project, category, productLabel, neighbors, family }: Props) {
  return (
    <CaseStudy
      project={project}
      kind="digital-experiences"
      category={category.name}
      productLabel={productLabel}
      family={family}
      neighbors={neighbors}
    />
  );
}
