export const INITIAL_VISIBLE = 6;

/** Keep both slices in their original order; the caller renders both in server HTML. */
export function splitVisible<T>(projects: readonly T[], visibleCount: number) {
  return { visible: projects.slice(0, visibleCount), extra: projects.slice(visibleCount) };
}
