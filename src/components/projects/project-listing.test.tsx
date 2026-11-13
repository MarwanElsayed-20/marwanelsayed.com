import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { digitalExperiences } from "@/config/projects";
import type { Project } from "@/lib/projects/types";
import { ProjectListing } from "./project-listing";

afterEach(cleanup);

const make = (slug: string, category: Project["category"]): Project => ({
  slug,
  title: `Title ${slug}`,
  category,
  summary: "Summary.",
});

describe("ProjectListing", () => {
  it("shows the page header and the empty state when there are no projects", () => {
    render(
      <ProjectListing section={digitalExperiences} projects={[]} basePath="/websites-ecommerce" />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Websites & E-commerce");
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Selected work is being added",
    );
    const home = screen.getByRole("link", { name: "Back to home" });
    expect(home.getAttribute("href")).toBe("/");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("groups by category in the fixed order and hides empty categories", () => {
    render(
      <ProjectListing
        section={digitalExperiences}
        projects={[
          make("b", "interactive-websites"),
          make("a", "e-commerce"),
          make("c", "e-commerce"),
        ]}
        basePath="/websites-ecommerce"
      />,
    );
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["E-commerce", "Interactive websites"]);
    expect(screen.queryByText("Landing pages")).toBeNull();
    expect(screen.queryByText("Selected work is being added")).toBeNull();
  });

  it("links every card to its project page under the given base path", () => {
    render(
      <ProjectListing
        section={digitalExperiences}
        projects={[make("a", "e-commerce")]}
        basePath="/design-system/digital-experiences"
      />,
    );
    expect(screen.getByRole("link", { name: /Title a/ }).getAttribute("href")).toBe(
      "/design-system/digital-experiences/a",
    );
  });
});
