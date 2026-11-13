export type SectionPosition = { readonly id: string; readonly top: number };

/** Positions are relative to the viewport's section-navigation offset. */
export function chooseCurrentSection(entries: readonly SectionPosition[]): string | null {
  let current: SectionPosition | undefined;
  for (const entry of entries) {
    if (entry.top <= 0 && (current === undefined || entry.top > current.top)) current = entry;
  }
  return current?.id ?? null;
}
