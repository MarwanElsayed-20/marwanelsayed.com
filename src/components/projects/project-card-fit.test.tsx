import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { categories, digitalProducts } from "@/config/projects";
import type { ProductProject } from "@/lib/projects/types";
import { ProjectCard } from "./project-card";
import { ProjectListing } from "./project-listing";

afterEach(cleanup);

const withImage: ProductProject = {
  slug: "a-product",
  title: "A product",
  category: "dashboards",
  summary: "A summary.",
  builtWith: ["Tool one"],
  screens: [
    { src: "/projects/a-product/two.webp", width: 800, height: 600, alt: "Another screen" },
  ],
  image: { src: "/projects/a-product/one.webp", width: 1600, height: 1000, alt: "A dashboard" },
};

function renderCard(imageFit?: "cover" | "contain") {
  return render(
    <ProjectCard
      project={withImage}
      category={categories.dashboards}
      href="/saas-dashboards/a-product"
      imageFit={imageFit}
    />,
  );
}

describe("ProjectCard image fit", () => {
  it("crops to fill by default", () => {
    const { container } = renderCard();
    expect(container.querySelector("img")?.className).toContain("object-cover");
  });

  it("shows the whole image when asked to contain", () => {
    const { container } = renderCard("contain");
    const img = container.querySelector("img");
    expect(img?.className).toContain("object-contain");
    expect(img?.className).not.toContain("object-cover");
  });

  it("still never shows tools or further screens, and is one link named with the category", () => {
    renderCard("contain");
    expect(screen.queryByText("Tool one")).toBeNull();
    expect(screen.queryByAltText("Another screen")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "A product, Dashboards" })).toBeTruthy();
  });
});

describe("ProjectListing for SaaS & Dashboards", () => {
  it("shows the product empty state and heading", () => {
    render(<ProjectListing section={digitalProducts} projects={[]} basePath="/saas-dashboards" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("SaaS & Dashboards");
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Selected product work is being added",
    );
    expect(screen.getByRole("link", { name: "Back to home" }).getAttribute("href")).toBe("/");
  });

  it("uses whole-image cards, in the product category order", () => {
    const { container } = render(
      <ProjectListing
        section={digitalProducts}
        projects={[
          { ...withImage, slug: "b", title: "B" },
          { ...withImage, slug: "a", title: "A", category: "saas-products" },
        ]}
        basePath="/saas-dashboards"
      />,
    );
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["SaaS products", "Dashboards"]);
    for (const img of Array.from(container.querySelectorAll("img"))) {
      expect(img.className).toContain("object-contain");
    }
  });
});
