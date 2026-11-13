import { describe, expect, it } from "vitest";
import { productProjects, projects } from "./repository";
import { topTechnologies } from "./technologies";

describe("topTechnologies", () => {
  it("counts each technology once per project, ignoring case, most common first", () => {
    const result = topTechnologies(
      [
        { builtWith: ["React", "react", "Vite"] },
        { builtWith: ["React", "Vite", "Zustand"] },
        { builtWith: ["Zustand"] },
        {},
      ],
      10,
    );
    expect(result).toEqual([
      { name: "React", count: 2 },
      { name: "Vite", count: 2 },
      { name: "Zustand", count: 2 },
    ]);
  });

  it("limits the list and breaks ties alphabetically", () => {
    expect(topTechnologies([{ builtWith: ["b", "a", "c"] }], 2).map((t) => t.name)).toEqual([
      "a",
      "b",
    ]);
  });

  it("leaves out excluded names in any case", () => {
    expect(
      topTechnologies([{ builtWith: ["EmailJS", "React"] }], 5, ["emailjs"]).map((t) => t.name),
    ).toEqual(["React"]);
  });

  it("only reports technologies recorded on real projects", () => {
    const recorded = new Set(
      [...projects, ...productProjects]
        .flatMap((p) => p.builtWith ?? [])
        .map((t) => t.toLowerCase()),
    );
    for (const technology of topTechnologies([...projects, ...productProjects], 30))
      expect(recorded.has(technology.name.toLowerCase())).toBe(true);
  });
});
