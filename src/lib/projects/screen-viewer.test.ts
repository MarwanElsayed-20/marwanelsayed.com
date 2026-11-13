import { expect, it } from "vitest";
import { canMove, keyAction, moveScreen, positionText } from "./screen-viewer";
it("never wraps and clamps explicit indices", () => {
  expect(moveScreen(0, 3, "previous")).toBe(0);
  expect(moveScreen(2, 3, "next")).toBe(2);
  expect(moveScreen(1, 3, "first")).toBe(0);
  expect(moveScreen(0, 3, "last")).toBe(2);
  expect(moveScreen(1, 3, -10)).toBe(0);
  expect(moveScreen(1, 3, 10)).toBe(2);
  expect(moveScreen(0, 0, "next")).toBe(0);
});
it("maps only supported keys", () => {
  expect(["ArrowRight", "ArrowLeft", "Home", "End", "Enter", "a"].map(keyAction)).toEqual([
    "next",
    "previous",
    "first",
    "last",
    undefined,
    undefined,
  ]);
});
it("reports one-based positions and available directions", () => {
  expect(positionText(0, 3)).toBe("1 of 3");
  expect(positionText(2, 3)).toBe("3 of 3");
  expect(canMove(0, 1)).toEqual({ previous: false, next: false });
  expect(canMove(0, 0)).toEqual({ previous: false, next: false });
  expect(canMove(0, 3)).toEqual({ previous: false, next: true });
  expect(canMove(2, 3)).toEqual({ previous: true, next: false });
});
