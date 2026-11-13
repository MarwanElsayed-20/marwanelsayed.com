import { families, type ProductFamily } from "@/content/projects/families";
import { productLabels, workOrder } from "@/content/projects/work-order";
import { projects, productProjects } from "./repository";
import { buildWorkEntries, type WorkEntry } from "./work";

/** Validate static content before any family reaches a generated page. */
export function buildFamilies(
  input: readonly ProductFamily[],
  order: readonly string[],
  knownSlugs: readonly string[],
): readonly ProductFamily[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const known = new Set(knownSlugs);
  for (const family of input) {
    const fail = (reason: string, slug = family.members[0]?.slug ?? "(no member)") => {
      throw new Error(`Family ${family.id} (${family.name}), slug ${slug}: ${reason}`);
    };
    const text = (value: string, limit: number, field: string, slug?: string) => {
      if (!value.trim() || value.length > limit || /http|<[^>]*>/i.test(value))
        fail(`invalid ${field} (1-${limit} characters, plain text, no http)`, slug);
    };
    text(family.id, 40, "id");
    if (!/^[a-z0-9-]+$/.test(family.id)) fail("invalid id");
    if (ids.has(family.id)) fail("duplicate family id");
    ids.add(family.id);
    text(family.name, 40, "name");
    if (family.members.length < 2 || family.members.length > 5) fail("requires 2-5 members");
    if (family.story !== undefined) {
      if (family.story.length < 1 || family.story.length > 3) fail("requires 1-3 story paragraphs");
      for (const paragraph of family.story) text(paragraph, 400, "story");
    }
    let previous = -1;
    for (const member of family.members) {
      text(member.slug, 100, "slug", member.slug);
      text(member.part, 40, "part", member.slug);
      if (!known.has(member.slug)) fail("unknown member", member.slug);
      if (slugs.has(member.slug)) fail("duplicate member", member.slug);
      slugs.add(member.slug);
      const index = order.indexOf(member.slug);
      if (index < 0 || (previous >= 0 && index !== previous + 1))
        fail("members must be consecutive in Work order", member.slug);
      previous = index;
    }
  }
  return input;
}

export type FamilyView = {
  name: string;
  story?: readonly string[];
  members: readonly (Pick<WorkEntry, "slug" | "title" | "href" | "image"> & {
    part: string;
    current: boolean;
  })[];
};

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
const validated = buildFamilies(
  families,
  workOrder,
  entries.map((entry) => entry.slug),
);
const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));

export function familyFor(slug: string): FamilyView | undefined {
  const family = validated.find((family) => family.members.some((member) => member.slug === slug));
  if (!family) return undefined;
  return {
    name: family.name,
    story: family.story,
    members: family.members.map((member) => {
      const entry = bySlug.get(member.slug)!;
      return {
        slug: entry.slug,
        part: member.part,
        title: entry.title,
        href: entry.href,
        image: entry.image,
        current: member.slug === slug,
      };
    }),
  };
}
