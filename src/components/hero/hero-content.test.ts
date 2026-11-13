import { describe, expect, it } from "vitest";
import { findPlaceholder } from "@/lib/site/placeholder-patterns";
import { heroContent } from "./hero";

describe("heroContent", () => {
  it("names the owner above the role", () => {
    expect(heroContent.name).toBe("Marwan Elsayed");
    expect(heroContent.role).toBe("Front-end engineer");
  });

  it("has an introduction and no leftover placeholder copy", () => {
    expect(heroContent.intro.trim().length).toBeGreaterThan(0);
    expect(findPlaceholder(heroContent.intro)).toBeNull();
  });
});
