import { SAMPLE_IMAGE_PREFIX } from "@/lib/projects/sample";
import type {
  BaseProject,
  CategoryId,
  ProjectImage,
  SectionId,
  ValidationMode,
} from "@/lib/projects/types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRODUCTION_IMAGE_SRC = /^\/projects\/[A-Za-z0-9._/-]+\.(avif|webp|png|jpe?g)$/;
const STATUSES: readonly string[] = ["live", "offline", "archived"];
const MAX_SCREENS = 10;

/** Fields every project may have. */
const BASE_FIELDS: readonly string[] = [
  "slug",
  "title",
  "category",
  "summary",
  "image",
  "builtWith",
  "period",
  "progress",
  "status",
  "liveLink",
  "sample",
];

/** The extra fields each section allows. Anything else is rejected. */
const SECTION_RULES: Record<
  SectionId,
  { paragraphs: readonly string[]; extras: readonly string[] }
> = {
  "digital-experiences": {
    paragraphs: ["context", "role", "approach", "outcomes"],
    extras: ["screens", "scope", "features", "decisions"],
  },
  "digital-products": {
    paragraphs: [
      "productContext",
      "usersAndProblems",
      "workflows",
      "designDecisions",
      "role",
      "outcomes",
    ],
    extras: ["screens", "scope", "features", "decisions"],
  },
};

function inRange(value: unknown, min: number, max: number): boolean {
  if (typeof value !== "string") return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

/**
 * Returns one message per problem, in the form
 * `projects[2] "my-slug": title: is required`. Never throws.
 * `sectionId` decides which section-specific fields are allowed; it defaults to Websites & E-commerce.
 */
export function validateProjects(
  projects: readonly BaseProject[],
  mode: ValidationMode,
  categoryIds: readonly CategoryId[],
  sectionId: SectionId = "digital-experiences",
): string[] {
  const rules = SECTION_RULES[sectionId];
  const allowedFields = [...BASE_FIELDS, ...rules.paragraphs, ...rules.extras];
  const errors: string[] = [];
  const firstSlug = new Map<string, number>();
  const firstTitle = new Map<string, number>();

  projects.forEach((project, index) => {
    const record = project as unknown as Record<string, unknown>;
    const slugText =
      typeof project.slug === "string" && project.slug !== "" ? project.slug : "(no slug)";
    const label = `projects[${index}] "${slugText}"`;
    const fail = (field: string, problem: string) => {
      errors.push(`${label}: ${field}: ${problem}`);
    };
    const checkText = (field: string, value: unknown, max: number, required: boolean) => {
      if (value === undefined || (required && typeof value === "string" && value.trim() === "")) {
        if (required) fail(field, "is required");
        return;
      }
      if (!inRange(value, 1, max)) fail(field, `must be 1 to ${max} characters`);
    };
    const checkImage = (value: unknown, prefix: string) => {
      if (typeof value !== "object" || value === null) {
        fail(prefix, "must be an image");
        return;
      }
      const image = value as ProjectImage;
      const srcOk =
        typeof image.src === "string" &&
        (mode === "production"
          ? PRODUCTION_IMAGE_SRC.test(image.src) && !image.src.includes("..")
          : image.src.startsWith(SAMPLE_IMAGE_PREFIX));
      if (!srcOk) {
        fail(
          `${prefix}.src`,
          mode === "production"
            ? "must start with /projects/ and end in .avif, .webp, .png, .jpg, or .jpeg"
            : `must start with ${SAMPLE_IMAGE_PREFIX}`,
        );
      }
      if (!isPositiveInteger(image.width)) fail(`${prefix}.width`, "must be a positive integer");
      if (!isPositiveInteger(image.height)) fail(`${prefix}.height`, "must be a positive integer");
      const hasAlt = image.alt !== undefined;
      const hasDecorative = image.decorative !== undefined;
      if (hasAlt === hasDecorative) {
        fail(prefix, "provide exactly one of alt or decorative");
      } else if (hasAlt && !inRange(image.alt, 1, 200)) {
        fail(`${prefix}.alt`, "must be 1 to 200 characters");
      } else if (hasDecorative && image.decorative !== true) {
        fail(`${prefix}.decorative`, "must be true");
      }
      if (image.caption !== undefined && !inRange(image.caption, 1, 160)) {
        fail(`${prefix}.caption`, "must be 1 to 160 characters");
      }
      if (
        image.view !== undefined &&
        !["desktop", "tablet", "phone", "state"].includes(image.view)
      ) {
        fail(`${prefix}.view`, "must be desktop, tablet, phone or state");
      }
      if (
        prefix.startsWith("screens[") &&
        image.view !== undefined &&
        image.view !== "desktop" &&
        !inRange(image.caption, 1, 160)
      ) {
        fail(`${prefix}.caption`, "is required for non-desktop views");
      }
      if (image.kind !== undefined) {
        if (image.kind === "capture") {
          if (!inRange(image.caption, 1, 160)) fail(prefix + ".caption", "is required for kind");
          if (image.decorative !== undefined) fail(prefix + ".decorative", "not allowed with kind");
          if (typeof image.alt !== "string" || !image.alt.toLowerCase().includes("capture"))
            fail(prefix + ".alt", "must contain the kind word");
        } else if (image.kind !== "illustration" && image.kind !== "reconstruction") {
          fail(prefix + ".kind", "must be illustration, reconstruction or capture");
        } else {
          if (!inRange(image.caption, 1, 160)) fail(prefix + ".caption", "is required for kind");
          if (image.decorative !== undefined) fail(prefix + ".decorative", "not allowed with kind");
          if (typeof image.alt !== "string" || !image.alt.toLowerCase().includes(image.kind))
            fail(prefix + ".alt", "must contain the kind word");
          const caption = typeof image.caption === "string" ? image.caption.toLowerCase() : "";
          if (!caption.includes("not a screenshot"))
            fail(prefix + ".caption", 'must contain "not a screenshot"');
          if (image.kind === "reconstruction" && !caption.includes("sample data"))
            fail(prefix + ".caption", 'must contain "sample data"');
        }
      }
    };

    // slug
    if (typeof project.slug !== "string" || project.slug === "") {
      fail("slug", "is required");
    } else {
      if (project.slug.length > 60 || !SLUG.test(project.slug)) {
        fail("slug", "must be lowercase letters, numbers, and single hyphens (1 to 60 characters)");
      }
      const first = firstSlug.get(project.slug);
      if (first === undefined) firstSlug.set(project.slug, index);
      else fail("slug", `duplicates projects[${first}]`);
    }

    // title
    checkText("title", project.title, 80, true);
    if (typeof project.title === "string" && project.title.trim() !== "") {
      const key = project.title.trim().toLowerCase();
      const first = firstTitle.get(key);
      if (first === undefined) firstTitle.set(key, index);
      else fail("title", `duplicates projects[${first}]`);
    }

    // category
    if (project.category === undefined) {
      fail("category", "is required");
    } else if (!categoryIds.includes(project.category)) {
      fail("category", `"${String(project.category)}" is not one of ${categoryIds.join(", ")}`);
    }

    // summary and period
    checkText("summary", project.summary, 200, true);
    checkText("period", project.period, 40, false);

    // paragraph fields (they differ per section)
    for (const field of rules.paragraphs) {
      const value = record[field];
      if (value === undefined) continue;
      if (!Array.isArray(value)) {
        fail(field, "must be a list of paragraphs");
        continue;
      }
      if (value.length > 6) fail(field, "must have at most 6 paragraphs");
      value.forEach((paragraph: unknown, i: number) => {
        if (!inRange(paragraph, 1, 1200)) fail(`${field}[${i}]`, "must be 1 to 1200 characters");
      });
    }

    if (record.scope !== undefined && !inRange(record.scope, 20, 220)) {
      fail("scope", "must be 20 to 220 characters");
    }
    const checkList = (
      field: string,
      value: unknown,
      max: number,
      check: (entry: unknown, path: string) => void,
    ) => {
      if (!Array.isArray(value) || value.length === 0) {
        fail(field, "must be a non-empty list");
        return;
      }
      if (value.length > max) fail(field, `must have at most ${max} entries`);
      value.forEach((entry, i) => check(entry, `${field}[${i}]`));
    };
    if (record.features !== undefined)
      checkList("features", record.features, 6, (entry, path) => {
        if (typeof entry !== "object" || entry === null) {
          fail(path, "must be a feature group");
          return;
        }
        const group = entry as Record<string, unknown>;
        checkText(`${path}.title`, group.title, 60, true);
        checkList(`${path}.points`, group.points, 5, (point, pointPath) => {
          if (!inRange(point, 1, 200)) fail(pointPath, "must be 1 to 200 characters");
        });
      });
    if (record.decisions !== undefined)
      checkList("decisions", record.decisions, 8, (entry, path) => {
        if (typeof entry !== "object" || entry === null) {
          fail(path, "must be a decision");
          return;
        }
        const decision = entry as Record<string, unknown>;
        checkText(`${path}.title`, decision.title, 80, true);
        checkText(`${path}.detail`, decision.detail, 400, true);
      });

    // builtWith
    const builtWith = record.builtWith;
    if (builtWith !== undefined) {
      if (!Array.isArray(builtWith)) {
        fail("builtWith", "must be a list of short labels");
      } else {
        if (builtWith.length > 12) fail("builtWith", "must have at most 12 entries");
        const seen = new Map<string, number>();
        builtWith.forEach((entry: unknown, i: number) => {
          if (!inRange(entry, 1, 40)) {
            fail(`builtWith[${i}]`, "must be 1 to 40 characters");
            return;
          }
          const key = (entry as string).trim().toLowerCase();
          const first = seen.get(key);
          if (first === undefined) seen.set(key, i);
          else fail(`builtWith[${i}]`, `duplicates builtWith[${first}]`);
        });
      }
    }

    // progress
    if (
      project.progress !== undefined &&
      !["in-progress", "completed"].includes(project.progress)
    ) {
      fail("progress", "must be in-progress or completed");
    }

    // status
    if (project.status !== undefined && !STATUSES.includes(project.status)) {
      fail("status", "must be live, offline, or archived");
    }

    // image
    if (record.image !== undefined) checkImage(record.image, "image");

    // screens (both sections)
    if (rules.extras.includes("screens") && record.screens !== undefined) {
      const screens = record.screens;
      if (!Array.isArray(screens)) {
        fail("screens", "must be a list of images");
      } else {
        if (screens.length > MAX_SCREENS) {
          fail("screens", `must have at most ${MAX_SCREENS} entries`);
        }
        screens.forEach((entry: unknown, i: number) => checkImage(entry, `screens[${i}]`));
      }
    }

    // live link
    const link = project.liveLink;
    if (link !== undefined) {
      if (mode === "sample") {
        fail("liveLink", "not allowed in sample data");
      } else if (project.status === "offline" || project.status === "archived") {
        fail("liveLink", "not allowed when status is offline or archived");
      }
      if (!isHttpsUrl(link.url)) {
        fail("liveLink.url", "must be a valid https URL without credentials");
      }
      if (link.label !== undefined && !inRange(link.label, 1, 60)) {
        fail("liveLink.label", "must be 1 to 60 characters");
      }
    }

    // sample flag
    if (mode === "production") {
      if (project.sample !== undefined) fail("sample", "not allowed in production data");
    } else if (project.sample !== true) {
      fail("sample", "must be true in sample data");
    }

    // fields that belong to the other section, or to neither
    for (const key of Object.keys(record)) {
      if (record[key] !== undefined && !allowedFields.includes(key)) {
        fail(key, "is not a field of this section");
      }
    }
  });

  return errors;
}

/** Throws one Error listing every problem. Returns the input so it can be exported directly. */
export function assertValidProjects<T extends BaseProject>(
  projects: readonly T[],
  mode: ValidationMode,
  categoryIds: readonly CategoryId[],
  sectionId: SectionId = "digital-experiences",
): readonly T[] {
  const errors = validateProjects(projects, mode, categoryIds, sectionId);
  if (errors.length > 0) {
    throw new Error(`Invalid project data (${mode}):\n${errors.join("\n")}`);
  }
  return projects;
}
