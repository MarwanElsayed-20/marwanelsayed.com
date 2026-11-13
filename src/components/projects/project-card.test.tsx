import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { categories } from "@/config/projects";
import type { Project } from "@/lib/projects/types";
import { ProjectCard } from "./project-card";

afterEach(cleanup);

const project: Project = {
  slug: "a-project",
  title: "A project",
  category: "e-commerce",
  summary: "A summary.",
  builtWith: ["Tool one"],
  period: "Period one",
  status: "offline",
};

function renderCard(p: Project) {
  return render(
    <ProjectCard
      project={p}
      category={categories[p.category]}
      href="/websites-ecommerce/a-project"
    />,
  );
}

describe("ProjectCard", () => {
  it("is exactly one link whose name includes the category", () => {
    renderCard(project);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/websites-ecommerce/a-project");
    expect(screen.getByRole("link", { name: "A project, E-commerce" })).toBeTruthy();
  });

  it("shows title, summary, and category but never tools, period, or status", () => {
    renderCard(project);
    expect(screen.getByText("A summary.")).toBeTruthy();
    expect(screen.getByText("E-commerce")).toBeTruthy();
    expect(screen.queryByText("Tool one")).toBeNull();
    expect(screen.queryByText("Period one")).toBeNull();
    expect(screen.queryByText(/no longer online/i)).toBeNull();
  });

  it("shows a hidden lettered frame and no image when there is no image", () => {
    const { container } = renderCard(project);
    expect(container.querySelector("img")).toBeNull();
    const frame = container.querySelector('[aria-hidden="true"]');
    expect(frame?.textContent).toBe("A");
  });

  it("renders a lazy image with its size and alt text", () => {
    const { container } = renderCard({
      ...project,
      image: {
        src: "/projects/a-project/cover.webp",
        width: 1200,
        height: 800,
        alt: "A description",
      },
    });
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("A description");
    expect(img?.getAttribute("loading")).toBe("lazy");
    expect(img?.getAttribute("width")).toBe("1200");
    expect(img?.getAttribute("height")).toBe("800");
  });

  it("renders a decorative image with empty alt text", () => {
    const { container } = renderCard({
      ...project,
      image: { src: "/projects/a-project/cover.webp", width: 1200, height: 800, decorative: true },
    });
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("shows the sample label only for sample projects", () => {
    renderCard({ ...project, sample: true });
    expect(screen.getByText("Sample content")).toBeTruthy();
    cleanup();
    renderCard(project);
    expect(screen.queryByText("Sample content")).toBeNull();
  });
});
