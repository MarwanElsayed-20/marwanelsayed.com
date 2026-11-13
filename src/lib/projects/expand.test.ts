import { describe, expect, it } from "vitest";
import { INITIAL_VISIBLE, splitVisible } from "./expand";

describe("splitVisible", () => {
  it.each([0, 1, 6])("keeps all %i items visible", (count) => {
    const items = Array.from({ length: count }, (_, i) => i);
    expect(splitVisible(items, INITIAL_VISIBLE)).toEqual({ visible: items, extra: [] });
  });
  it("preserves order without dropping or mutating items", () => {
    const items = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]);
    const result = splitVisible(items, INITIAL_VISIBLE);
    expect(result.visible).toEqual(items.slice(0, 6));
    expect(result.extra).toEqual([6, 7]);
    expect([...result.visible, ...result.extra]).toEqual(items);
    expect(splitVisible(items, items.length).extra).toEqual([]);
  });
});
