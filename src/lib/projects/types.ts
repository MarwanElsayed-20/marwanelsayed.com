export type CategoryId =
  "e-commerce" | "landing-pages" | "interactive-websites" | "saas-products" | "dashboards";

export type SectionId = "digital-experiences" | "digital-products";

export type ProjectStatus = "live" | "offline" | "archived";

/** Whether the work is still going or finished: shown on the Work index and the case study. */
export type ProjectProgress = "in-progress" | "completed";

export type ImageKind = "illustration" | "reconstruction" | "capture";

export type ProjectImage = {
  /** Production: a file under /projects/ in `public/`. */
  src: string;
  width: number;
  height: number;
  /** Provide exactly one of `alt` and `decorative`. */
  alt?: string;
  decorative?: true;
  caption?: string;
  view?: "desktop" | "tablet" | "phone" | "state";
  /** Present only on images that are illustrations, reconstructions or captures. Drives the card label. */
  kind?: ImageKind;
};

export type LiveLink = {
  url: string;
  /** Visible link text. Defaults to `Visit {title}`. */
  label?: string;
};

/** Fields every project has, in every section. */
export type BaseProject = {
  slug: string;
  title: string;
  category: CategoryId;
  summary: string;
  image?: ProjectImage;
  builtWith?: readonly string[];
  scope?: string;
  features?: readonly { title: string; points: readonly string[] }[];
  decisions?: readonly { title: string; detail: string }[];
  /** The year it started (nothing else about its dates is shown). */
  period?: string;
  progress?: ProjectProgress;
  status?: ProjectStatus;
  liveLink?: LiveLink;
  /** Review-only sample content. Forbidden in production data. */
  sample?: true;
};

/** A Websites & E-commerce record. */
export type Project = BaseProject & {
  context?: readonly string[];
  role?: readonly string[];
  approach?: readonly string[];
  outcomes?: readonly string[];
  /** Further images, shown in the Walkthrough. At most 6. */
  screens?: readonly ProjectImage[];
};

/** A SaaS & Dashboards record. */
export type ProductProject = BaseProject & {
  productContext?: readonly string[];
  usersAndProblems?: readonly string[];
  workflows?: readonly string[];
  designDecisions?: readonly string[];
  role?: readonly string[];
  outcomes?: readonly string[];
  /** Further images, shown in the Walkthrough. At most 6. */
  screens?: readonly ProjectImage[];
};

export type ProjectCategory = {
  id: CategoryId;
  name: string;
  description: string;
};

/** How a card shows its image: cropped to fill the frame, or whole inside it. */
export type CardImageFit = "cover" | "contain";

export type ProjectSection = {
  id: SectionId;
  name: string;
  basePath: string;
  title: string;
  intro: string;
  description: string;
  categoryIds: readonly CategoryId[];
  cardImageFit: CardImageFit;
  empty: {
    heading: string;
    body: string;
    linkLabel: string;
    linkHref: string;
  };
};

export type ValidationMode = "production" | "sample";
