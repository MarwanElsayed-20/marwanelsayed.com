import { digitalProducts } from "@/config/projects";
import { SAMPLE_IMAGE_PREFIX } from "@/lib/projects/sample";
import type { ProductProject, ProjectImage } from "@/lib/projects/types";
import { assertValidProjects } from "@/lib/projects/validate";

/** Stand-in images served by the gated review route. They are drawings, never real screens. */
const dashboard = { src: `${SAMPLE_IMAGE_PREFIX}dashboard.svg`, width: 1600, height: 1000 };
const narrow = { src: `${SAMPLE_IMAGE_PREFIX}screen-narrow.svg`, width: 750, height: 1334 };
const wide = { src: `${SAMPLE_IMAGE_PREFIX}one.svg`, width: 800, height: 500 };
const standard = { src: `${SAMPLE_IMAGE_PREFIX}two.svg`, width: 800, height: 600 };
const tall = { src: `${SAMPLE_IMAGE_PREFIX}three.svg`, width: 600, height: 800 };

/** The maximum number of screens, each with its own alt text. */
const manyScreens: ProjectImage[] = [narrow, wide, standard, tall, dashboard, narrow].map(
  (base, i) => ({ ...base, alt: `Sample stand-in screen ${i + 1}.` }),
);

/**
 * REVIEW-ONLY sample content that exercises layouts and states. Generic on purpose: no real or
 * realistic names, metrics, quotes, or links. Imported only by files under src/app/design-system/.
 * Card order on the review listing (grouped by category): full, offline, long, many screens,
 * minimal, no image.
 */
export const sampleProducts: readonly ProductProject[] = assertValidProjects(
  [
    {
      slug: "sample-product-full",
      title: "Sample product: full page",
      category: "saas-products",
      summary: "Sample summary used to exercise a product page with every optional section.",
      image: {
        ...dashboard,
        alt: "Sample dashboard-like stand-in image.",
        caption: "Sample caption for the stand-in image.",
      },
      productContext: [
        "Sample product context paragraph one. It exists only to exercise the layout.",
        "Sample product context paragraph two.",
      ],
      usersAndProblems: ["Sample users and problems paragraph."],
      workflows: ["Sample workflow paragraph one.", "Sample workflow paragraph two."],
      designDecisions: ["Sample design decisions paragraph."],
      role: ["Sample role paragraph."],
      outcomes: ["Sample outcomes paragraph."],
      screens: [
        { ...narrow, alt: "Sample narrow stand-in screen." },
        { ...wide, alt: "Sample wide stand-in screen.", caption: "Sample caption for a screen." },
        { ...standard, decorative: true },
      ],
      builtWith: ["Sample tool one", "Sample tool two", "Sample tool three"],
      period: "Sample period",
      sample: true,
    },
    {
      slug: "sample-product-offline",
      title: "Sample product: offline",
      category: "saas-products",
      summary: "Sample summary for a product recorded as no longer online.",
      status: "offline",
      image: { ...standard, alt: "Sample line drawing used as a stand-in image." },
      productContext: ["Sample product context paragraph for an offline product."],
      sample: true,
    },
    {
      slug: "sample-product-long",
      title: "Sample product with a deliberately long title that wraps on narrow screens",
      category: "saas-products",
      summary:
        "Sample summary that is deliberately long so the card and the page both have to wrap text across several lines without clipping, including this long word: Supercalifragilisticexpialidocious.",
      sample: true,
    },
    {
      slug: "sample-product-screens",
      title: "Sample product: many screens",
      category: "dashboards",
      summary: "Sample summary for a product page with the maximum number of screens.",
      image: { ...dashboard, alt: "Sample dashboard-like stand-in image." },
      productContext: ["Sample product context paragraph."],
      screens: manyScreens,
      sample: true,
    },
    {
      slug: "sample-product-minimal",
      title: "Sample product: minimal page",
      category: "dashboards",
      summary: "Sample summary for a page with only the required fields.",
      sample: true,
    },
    {
      slug: "sample-product-no-image",
      title: "Sample product: no image",
      category: "dashboards",
      summary: "Sample summary for a product that has no image.",
      productContext: ["Sample product context paragraph."],
      role: ["Sample role paragraph."],
      sample: true,
    },
  ],
  "sample",
  digitalProducts.categoryIds,
  "digital-products",
);
