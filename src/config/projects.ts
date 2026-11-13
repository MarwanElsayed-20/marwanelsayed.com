import type { CategoryId, ProjectCategory, ProjectSection } from "@/lib/projects/types";

/** Display data for each category. The section decides which ones it shows and in what order. */
export const categories: Record<CategoryId, ProjectCategory> = {
  "e-commerce": {
    id: "e-commerce",
    name: "E-commerce",
    description: "Online stores and shopping experiences.",
  },
  "landing-pages": {
    id: "landing-pages",
    name: "Landing pages",
    description: "Focused pages built around a single goal.",
  },
  "interactive-websites": {
    id: "interactive-websites",
    name: "Interactive websites",
    description: "Sites where interaction is part of the experience.",
  },
  "saas-products": {
    id: "saas-products",
    name: "SaaS products",
    description: "Software products and the interfaces people use to work with them.",
  },
  dashboards: {
    id: "dashboards",
    name: "Dashboards",
    description: "Interfaces for monitoring, exploring, and acting on data.",
  },
};

export const digitalExperiences: ProjectSection = {
  id: "digital-experiences",
  name: "Websites & E-commerce",
  basePath: "/websites-ecommerce",
  title: "Websites & E-commerce",
  intro: "Selected work across e-commerce, landing pages, and interactive websites.",
  description: "Selected work across e-commerce, landing pages, and interactive websites.",
  categoryIds: ["e-commerce", "landing-pages", "interactive-websites"],
  cardImageFit: "cover",
  empty: {
    heading: "Selected work is being added",
    body: "Projects in this section will appear here once they are ready to share.",
    linkLabel: "Back to home",
    linkHref: "/",
  },
};

export const digitalProducts: ProjectSection = {
  id: "digital-products",
  name: "SaaS & Dashboards",
  basePath: "/saas-dashboards",
  title: "SaaS & Dashboards",
  intro: "Selected SaaS and dashboard work, presented as product case studies.",
  description: "Selected SaaS and dashboard work, presented as product case studies.",
  categoryIds: ["saas-products", "dashboards"],
  cardImageFit: "contain",
  empty: {
    heading: "Selected product work is being added",
    body: "Product case studies will appear here once they are ready to share.",
    linkLabel: "Back to home",
    linkHref: "/",
  },
};

/** Stable destination for every project back link. */
