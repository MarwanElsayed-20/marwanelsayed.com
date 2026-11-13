import { describe, expect, it } from "vitest";
import { findPlaceholder, PLACEHOLDER_PATTERNS } from "./placeholder-patterns";

const cases: readonly { id: string; match: string }[] = [
  { id: "lorem-ipsum", match: "Lorem ipsum dolor sit amet" },
  { id: "placeholder-word", match: "This is placeholder text" },
  { id: "tbd", match: "Dates TBD" },
  { id: "todo-fixme", match: "TODO: write this paragraph" },
  { id: "coming-soon", match: "More details coming soon" },
  { id: "to-be-added", match: "Background to be written" },
  { id: "later-phases", match: "Content arrives in later phases" },
  { id: "template-text", match: "Your name here" },
  { id: "bracketed-template", match: "Hello, I am [Your Name]" },
  { id: "example-domain", match: "write to sam@example.com" },
  { id: "reserved-host", match: "write to sam@mail.invalid" },
  { id: "reserved-host", match: "see https://studio.example for more" },
];

describe("findPlaceholder", () => {
  it.each(cases)("flags $id: $match", ({ id, match }) => {
    expect(findPlaceholder(match)).toBe(id);
  });

  it("has a case for every pattern", () => {
    const covered = new Set(cases.map((item) => item.id));
    for (const { id } of PLACEHOLDER_PATTERNS) {
      expect(covered.has(id), id).toBe(true);
    }
  });

  it.each([
    "I design and build websites and software products.",
    "Based in a small studio, working with teams of every size.",
    "https://github.com/someone",
    "someone@studio.co.uk",
    "See reference [1] for details.",
  ])("accepts real-looking text: %s", (text) => {
    expect(findPlaceholder(text)).toBeNull();
  });
});
