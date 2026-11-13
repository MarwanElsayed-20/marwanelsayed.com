import { productLabels, workOrder } from "@/content/projects/work-order";
import { selectedWorkContent, type SelectedWorkScene } from "@/content/site/selected-work";
import { productProjects, projects } from "./repository";
import type { BaseProject, ProjectImage } from "./types";
import { buildWorkEntries } from "./work";

export const MIN_SCENES = 3;
export const MAX_SCENES = 6;

type ProjectRecord = BaseProject & { screens?: readonly ProjectImage[] };

export type ResolvedScene = Omit<SelectedWorkScene, "links" | "captures"> & {
  /** "01", "02", ... in display order. */
  number: string;
  links: { label: string; href: string }[];
  /** The project records' own images, so alt text and sizes come from one place. */
  captures: ProjectImage[];
};

/** Resolves scene content against the project records, failing the build on anything missing. */
export function resolveScenes(
  scenes: readonly SelectedWorkScene[],
  records: readonly ProjectRecord[],
  hrefs: ReadonlyMap<string, string>,
): ResolvedScene[] {
  if (scenes.length < MIN_SCENES || scenes.length > MAX_SCENES)
    throw new Error(`Show ${MIN_SCENES} to ${MAX_SCENES} scenes, not ${scenes.length}`);
  const seen = new Set<string>();
  return scenes.map((scene, index) => {
    if (seen.has(scene.id)) throw new Error(`Duplicate scene: ${scene.id}`);
    seen.add(scene.id);
    if (scene.links.length === 0) throw new Error(`Scene ${scene.id} has no links`);
    if (scene.captures.length < 2) throw new Error(`Scene ${scene.id} needs two captures`);
    const links = scene.links.map(({ label, project }) => {
      const href = hrefs.get(project);
      if (!href) throw new Error(`Scene ${scene.id} links to an unknown project: ${project}`);
      return { label, href };
    });
    const captures = scene.captures.map(({ project, src }) => {
      const record = records.find((candidate) => candidate.slug === project);
      if (!record) throw new Error(`Scene ${scene.id} uses an unknown project: ${project}`);
      const image = [record.image, ...(record.screens ?? [])].find((item) => item?.src === src);
      if (!image) throw new Error(`Scene ${scene.id}: ${project} has no capture ${src}`);
      if (image.kind !== "capture" || !image.alt)
        throw new Error(`Scene ${scene.id}: ${src} must be a described capture`);
      return image;
    });
    return { ...scene, number: String(index + 1).padStart(2, "0"), links, captures };
  });
}

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);

export const selectedScenes = resolveScenes(
  selectedWorkContent.scenes,
  [...projects, ...productProjects],
  new Map(entries.map((entry) => [entry.slug, entry.href])),
);
