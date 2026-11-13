import type { ProductFamily } from "@/content/projects/families";
import { workProofSizes as sizes } from "@/content/site/work-proofs";
import type { CategoryId, ProjectImage, ProjectProgress, SectionId } from "./types";
import type { WorkEntry } from "./work";

export type WorkRowPart = { label: string; href: string };

/** One row of the Work index: a project, or a whole product family shown as one ecosystem. */
export type WorkRow = {
  /** The lead project's slug. It names the row, its colour world and its link. */
  slug: string;
  title: string;
  href: string;
  summary: string;
  section: SectionId;
  /** The lead's category: it picks the pattern behind the captures. */
  categoryId: CategoryId;
  /** The kinds of work in it, from our categories ("Dashboards", "Landing pages"). */
  categories: readonly string[];
  /** The year the first of its projects started, when recorded. */
  year?: string;
  progress?: ProjectProgress;
  role: string;
  /** What the lead is built with: the first three. */
  stack: readonly string[];
  /** The parts of an ecosystem, each a link to its own case study. */
  parts: readonly WorkRowPart[];
  /** The captures laid on its world: its card, then a second screen or another part's card. */
  proofs: readonly ProjectImage[];
  /** A short row under "More online stores": title and facts only. */
  compact: boolean;
};

const card = (slug: string): ProjectImage => ({
  src: `/work-proofs/${slug}.webp`,
  ...sizes[slug].card,
  decorative: true,
});
const screen = (slug: string): ProjectImage => ({
  src: `/work-proofs/${slug}-screen.webp`,
  ...sizes[slug].screen,
  decorative: true,
});

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];
const unique = <T>(values: readonly T[]) => [...new Set(values)];

export type RowOptions = {
  /** The role on a project where it was not the usual one. */
  roles: Readonly<Record<string, string>>;
  defaultRole: string;
  /** Section ids in the order their rows should follow. */
  sectionOrder: readonly SectionId[];
  /** Slugs shown as compact rows. They must close their area, so the full rows stay together. */
  compact?: readonly string[];
};

/**
 * The rows of the Work index. A product family becomes one row (its parts are links inside it);
 * every other project is a row of its own. Rows are grouped by area, in the approved order within
 * each, so ToolSwift stays first. Fails at build time if a family names a project that is missing.
 */
export function buildWorkRows(
  entries: readonly WorkEntry[],
  families: readonly ProductFamily[],
  options: RowOptions,
): WorkRow[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const familyOf = new Map<string, ProductFamily>();
  for (const family of families)
    for (const member of family.members) {
      if (!bySlug.has(member.slug)) throw new Error(`Family ${family.id}: unknown ${member.slug}`);
      familyOf.set(member.slug, family);
    }

  const done = new Set<string>();
  const rows: WorkRow[] = [];
  for (const entry of entries) {
    if (done.has(entry.slug)) continue;
    const family = familyOf.get(entry.slug);
    const members = family ? family.members.map((member) => bySlug.get(member.slug)!) : [entry];
    members.forEach((member) => done.add(member.slug));
    const lead = members[0];
    const years = members
      .map((member) => Number.parseInt(member.period ?? "", 10))
      .filter((year) => Number.isFinite(year));
    const progresses = members.map((member) => member.progress);
    rows.push({
      slug: lead.slug,
      title: family ? family.name : lead.title,
      href: lead.href,
      summary: family?.story?.[0] ? firstSentence(family.story[0]) : lead.summary,
      section: lead.section,
      categoryId: lead.categoryId,
      categories: unique(members.map((member) => member.category)),
      year: years.length ? String(Math.min(...years)) : undefined,
      progress: progresses.includes("in-progress")
        ? "in-progress"
        : progresses.includes("completed")
          ? "completed"
          : undefined,
      role: options.roles[lead.slug] ?? options.defaultRole,
      stack: (lead.builtWith ?? []).slice(0, 3),
      parts: family
        ? family.members.map((member, index) => ({
            label: member.part,
            href: members[index].href,
          }))
        : [],
      proofs: [card(lead.slug), members[1] ? card(members[1].slug) : screen(lead.slug)],
      compact: options.compact?.includes(lead.slug) ?? false,
    });
  }
  // Grouped by area; within an area the approved order is kept (a stable sort).
  const sorted = rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        options.sectionOrder.indexOf(a.row.section) - options.sectionOrder.indexOf(b.row.section) ||
        a.index - b.index,
    )
    .map(({ row }) => row);
  sorted.forEach((row, index) => {
    const next = sorted[index + 1];
    if (row.compact && next && next.section === row.section && !next.compact)
      throw new Error(`Compact row ${row.slug} must come after the full rows of its area`);
  });
  return sorted;
}
