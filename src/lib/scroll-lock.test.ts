import { afterEach, describe, expect, it } from "vitest";
import { lockScroll } from "./scroll-lock";

afterEach(() => {
  document.documentElement.removeAttribute("style");
});

describe("lockScroll", () => {
  it("hides overflow and restores the previous value on release", () => {
    document.documentElement.style.overflow = "scroll";
    const release = lockScroll();
    expect(document.documentElement.style.overflow).toBe("hidden");
    release();
    expect(document.documentElement.style.overflow).toBe("scroll");
  });

  it("stays locked until every holder has released", () => {
    const first = lockScroll();
    const second = lockScroll();
    first();
    expect(document.documentElement.style.overflow).toBe("hidden");
    second();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("ignores a repeated release", () => {
    const first = lockScroll();
    const second = lockScroll();
    first();
    first();
    expect(document.documentElement.style.overflow).toBe("hidden");
    second();
    expect(document.documentElement.style.overflow).toBe("");
  });
});
