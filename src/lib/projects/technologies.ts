export type TechnologyCount = { name: string; count: number };

/**
 * The technologies that appear most across project records, counted once per project.
 * Matching ignores case; the first spelling seen is the one shown. Ties sort alphabetically.
 * Names in `exclude` (any case) are left out of the list.
 */
export function topTechnologies(
  records: readonly { readonly builtWith?: readonly string[] }[],
  limit: number,
  exclude: readonly string[] = [],
): TechnologyCount[] {
  const skip = new Set(exclude.map((name) => name.trim().toLowerCase()));
  const counts = new Map<string, TechnologyCount>();
  for (const record of records) {
    const seen = new Set<string>();
    for (const raw of record.builtWith ?? []) {
      const name = raw.trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key) || skip.has(key)) continue;
      seen.add(key);
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { name, count: 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
