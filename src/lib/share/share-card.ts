import type { BaseProject } from "@/lib/projects/types";

export const SHARE_SIZE = { width: 1200, height: 630 } as const;

type ShareInput = { ownerName: string; title: string; sectionLabel?: string; line?: string };

/** Shortens text to `limit` characters at a word boundary, ending with an ellipsis. */
export function shorten(text: string, limit: number) {
  return text.length > limit
    ? `${text
        .slice(0, limit - 1)
        .replace(/\s+\S*$/, "")
        .trimEnd()}…`
    : text;
}

/**
 * The longest line shown under a title: four lines on a text card, five beside a cover. Every
 * page description and project summary fits; a longer line is left out.
 */
export const SHARE_LINE_LIMIT = 180;

/**
 * Bound display text to the card: the title is shortened to three lines; the line under it is
 * shown whole or not at all (a cut sentence reads as a mistake). The complete title is kept for
 * assistive text.
 */
export function shareCardText({ ownerName, title, sectionLabel, line }: ShareInput) {
  return {
    ownerName,
    title: shorten(title, 72),
    ...(sectionLabel ? { sectionLabel } : {}),
    ...(line && line.length <= SHARE_LINE_LIMIT ? { line } : {}),
    alt: title,
  };
}

/**
 * Projects whose cover capture is due to be replaced. Their share cards use text only until
 * then.
 */
const COVERS_NOT_SHARED: ReadonlySet<string> = new Set(["amherst-supply"]);

/** A cover file under public/projects/, PNG only (what the image renderer decodes). */
const COVER_PATH = /^\/projects\/[a-z0-9-]+\/[a-z0-9-]+\.png$/;

/**
 * The project's cover for its share card, or nothing. Only real captures are used (never an
 * illustration or reconstruction), and only from the project's own folder.
 */
export function shareCapture(project: Pick<BaseProject, "slug" | "image">) {
  const image = project.image;
  if (!image || image.kind !== "capture" || COVERS_NOT_SHARED.has(project.slug)) return undefined;
  if (!COVER_PATH.test(image.src) || !image.src.startsWith(`/projects/${project.slug}/`)) {
    return undefined;
  }
  return image.src;
}
