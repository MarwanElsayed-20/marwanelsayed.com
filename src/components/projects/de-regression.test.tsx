import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { categories, digitalExperiences } from "@/config/projects";
import { sampleProjects } from "@/content/projects/samples";
import { ProjectDetail } from "./project-detail";
import { ProjectListing } from "./project-listing";

afterEach(cleanup);

/** Listings remain stable; detail snapshots now cover the approved case-study layout. */
describe("Websites & E-commerce output is stable", () => {
  it("listing with the review projects", () => {
    const { container } = render(
      <ProjectListing
        section={digitalExperiences}
        projects={sampleProjects}
        basePath="/websites-ecommerce"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("empty listing", () => {
    const { container } = render(
      <ProjectListing section={digitalExperiences} projects={[]} basePath="/websites-ecommerce" />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  for (const project of sampleProjects) {
    it(`project page: ${project.slug}`, () => {
      const { container } = render(
        <ProjectDetail
          section={digitalExperiences}
          project={project}
          category={categories[project.category]}
          backHref="/websites-ecommerce"
        />,
      );
      expect(container.innerHTML).toMatchSnapshot();
    });
  }
});
