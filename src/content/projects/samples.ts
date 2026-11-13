import { digitalExperiences } from "@/config/projects";
import { SAMPLE_IMAGE_PREFIX } from "@/lib/projects/sample";
import type { Project } from "@/lib/projects/types";
import { assertValidProjects } from "@/lib/projects/validate";

/**
 * REVIEW-ONLY sample content that exercises layouts and states. Generic on purpose: no real or
 * realistic names, metrics, quotes, or links. Imported only by files under src/app/design-system/.
 * Card order on the review listing: full, portrait, minimal, offline, no-image, long.
 */
export const sampleProjects: readonly Project[] = assertValidProjects(
  [
    {
      slug: "sample-full",
      title: "Sample project: full page",
      category: "e-commerce",
      summary: "Sample summary used to exercise a page with every optional section.",
      image: {
        src: `${SAMPLE_IMAGE_PREFIX}one.svg`,
        width: 800,
        height: 500,
        alt: "Sample line drawing used as a stand-in image.",
        caption: "Sample caption for the stand-in image.",
      },
      context: [
        "Sample context paragraph one. It exists only to exercise the layout.",
        "Sample context paragraph two.",
      ],
      role: ["Sample role paragraph."],
      approach: ["Sample approach paragraph."],
      outcomes: ["Sample outcomes paragraph."],
      builtWith: ["Sample tool one", "Sample tool two", "Sample tool three"],
      period: "Sample period",
      sample: true,
    },
    {
      slug: "sample-portrait",
      title: "Sample project: portrait image",
      category: "e-commerce",
      summary: "Sample summary for a project whose stand-in image is taller than it is wide.",
      image: {
        src: `${SAMPLE_IMAGE_PREFIX}three.svg`,
        width: 600,
        height: 800,
        alt: "Sample tall line drawing used as a stand-in image.",
      },
      sample: true,
    },
    {
      slug: "sample-minimal",
      title: "Sample project: minimal page",
      category: "landing-pages",
      summary: "Sample summary for a page with only the required fields.",
      sample: true,
    },
    {
      slug: "sample-offline",
      title: "Sample project: offline",
      category: "landing-pages",
      summary: "Sample summary for a project recorded as no longer online.",
      status: "offline",
      image: {
        src: `${SAMPLE_IMAGE_PREFIX}two.svg`,
        width: 800,
        height: 600,
        alt: "Sample line drawing used as a stand-in image.",
      },
      context: ["Sample context paragraph for an offline project."],
      sample: true,
    },
    {
      slug: "sample-no-image",
      title: "Sample project: no image",
      category: "interactive-websites",
      summary: "Sample summary for a project that has no image.",
      context: ["Sample context paragraph."],
      role: ["Sample role paragraph."],
      sample: true,
    },
    {
      slug: "sample-long",
      title: "Sample project with a deliberately long title that wraps on narrow screens",
      category: "interactive-websites",
      summary:
        "Sample summary that is deliberately long so the card and the page both have to wrap text across several lines without clipping, including this long word: Supercalifragilisticexpialidocious.",
      sample: true,
    },
  ],
  "sample",
  digitalExperiences.categoryIds,
);
