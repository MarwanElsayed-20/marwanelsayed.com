import { digitalExperiences, digitalProducts } from "@/config/projects";
import { digitalExperiencesProjects } from "@/content/projects/digital-experiences";
import { digitalProductsProjects } from "@/content/projects/digital-products";
import { assertValidProjects } from "@/lib/projects/validate";

/** The validated production projects. A bad record fails the build here, naming the record and field. */
export const projects = assertValidProjects(
  digitalExperiencesProjects,
  "production",
  digitalExperiences.categoryIds,
);

/** The validated SaaS & Dashboards records, checked the same way with the product field rules. */
export const productProjects = assertValidProjects(
  digitalProductsProjects,
  "production",
  digitalProducts.categoryIds,
  "digital-products",
);
