export type ScreenAction = "next" | "previous" | "first" | "last" | number;

/** Bound navigation, including empty input; never wrap. */
export function moveScreen(index: number, count: number, action: ScreenAction): number {
  const last = Math.max(0, count - 1);
  const target =
    typeof action === "number"
      ? action
      : action === "next"
        ? index + 1
        : action === "previous"
          ? index - 1
          : action === "last"
            ? last
            : 0;
  return Math.min(last, Math.max(0, target));
}
export function keyAction(key: string): ScreenAction | undefined {
  switch (key) {
    case "ArrowRight":
      return "next";
    case "ArrowLeft":
      return "previous";
    case "Home":
      return "first";
    case "End":
      return "last";
    default:
      return undefined;
  }
}
export function positionText(index: number, count: number): string {
  return `${count ? moveScreen(index, count, index) + 1 : 0} of ${count}`;
}
export function canMove(index: number, count: number) {
  return { previous: count > 1 && index > 0, next: count > 1 && index < count - 1 };
}
