import { EmptyState } from "@/components/projects/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { Grid } from "@/components/ui/grid";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { groupByCategory, projectPath } from "@/lib/projects/select";
import type { BaseProject, ProjectSection } from "@/lib/projects/types";

type ProjectListingProps = {
  section: ProjectSection;
  projects: readonly BaseProject[];
  /** Where project pages live: the section path in production, the review path on review pages. */
  basePath: string;
};

export function ProjectListing({ section, projects, basePath }: ProjectListingProps) {
  const groups = groupByCategory(projects, section.categoryIds);
  return (
    <>
      <PageHeader title={section.title} intro={section.intro} />
      {groups.length === 0 ? (
        <EmptyState section={section} />
      ) : (
        groups.map((group) => (
          <Section
            key={group.category.id}
            heading={group.category.name}
            intro={group.category.description}
          >
            <Grid as="ul">
              {group.projects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard
                    project={project}
                    category={group.category}
                    href={projectPath(basePath, project.slug)}
                    imageFit={section.cardImageFit}
                  />
                </li>
              ))}
            </Grid>
          </Section>
        ))
      )}
    </>
  );
}
