import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { categories } from "@/config/projects";
import type { ImageKind, Project } from "@/lib/projects/types";
import { ProjectCard } from "./project-card";
afterEach(cleanup);
const card = (kind?: ImageKind) => {
  const project: Project = {
    slug: "test",
    title: "Test",
    category: "e-commerce",
    summary: "Summary",
    builtWith: ["Secret tool"],
    role: ["Hidden role"],
    period: "Hidden period",
    status: "live",
    liveLink: { url: "https://example.com", label: "Hidden live link" },
    image: { src: "/projects/test/card.png", width: 1600, height: 1000, alt: "Layout", kind },
  };
  return render(
    <ProjectCard
      project={project}
      category={categories[project.category]}
      href="/websites-ecommerce/test"
    />,
  );
};
describe("card image disclosure", () => {
  it.each([
    ["illustration", "Illustration"],
    ["reconstruction", "Reconstruction"],
    ["capture", "Real interface, sample data"],
  ] as const)("shows %s under the frame", (kind, label) => {
    const { container } = card(kind);
    const text = screen.getByText(label);
    expect(text.tagName).toBe("P");
    expect(text.closest('[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector("img")?.parentElement?.nextElementSibling).toBe(text);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Test, E-commerce" })).toBeTruthy();
    for (const value of ["Secret tool", "Hidden role", "Hidden period", "Hidden live link", "live"])
      expect(screen.queryByText(value)).toBeNull();
  });
  it("adds no label for existing images", () => {
    card();
    expect(screen.queryByText("Illustration")).toBeNull();
    expect(screen.queryByText("Reconstruction")).toBeNull();
  });
});
