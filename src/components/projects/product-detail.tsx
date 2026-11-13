import type { FamilyView } from "@/lib/projects/families";
import { CaseStudy } from "./case-study";
import type { ProductProject, ProjectCategory, ProjectSection } from "@/lib/projects/types";
import type { WorkNeighbors } from "@/lib/projects/work";

type Props = {
  section: ProjectSection;
  project: ProductProject;
  category: ProjectCategory;
  /** Retained for review route compatibility; all case studies return to Work. */
  backHref: string;
  productLabel?: string;
  neighbors?: WorkNeighbors;
  family?: FamilyView;
};

export function ProductDetail({ project, category, productLabel, neighbors, family }: Props) {
  return (
    <CaseStudy
      project={project}
      kind="digital-products"
      category={category.name}
      productLabel={productLabel}
      family={family}
      neighbors={neighbors}
    />
  );
}
