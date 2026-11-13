import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ProjectDetail } from "./project-detail";
import { categories, digitalExperiences } from "@/config/projects";
import type { Project } from "@/lib/projects/types";
afterEach(cleanup);
const project: Project = {
  slug: "test",
  title: "Test project",
  category: "e-commerce",
  summary: "Summary",
};
it("adapts the record to the shared case study and always returns to Work", () => {
  render(
    <ProjectDetail
      section={digitalExperiences}
      project={project}
      category={categories[project.category]}
      backHref="/design-system"
      productLabel="Product"
    />,
  );
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(project.title);
  expect(screen.getByText("Product")).toBeTruthy();
  expect(screen.getAllByRole("link", { name: "Back to Work" })[0].getAttribute("href")).toBe(
    "/work",
  );
});
it("never renders recorded live links or offline notices", () => {
  const { container } = render(
    <ProjectDetail
      section={digitalExperiences}
      project={{ ...project, status: "live", liveLink: { url: "https://example.com" } }}
      category={categories[project.category]}
      backHref="/work"
    />,
  );
  expect(container.querySelector('a[href^="https:"]')).toBeNull();
  expect(screen.queryByText(/Visit|no longer online/)).toBeNull();
});
