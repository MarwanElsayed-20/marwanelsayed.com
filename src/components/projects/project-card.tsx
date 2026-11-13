import { ProjectCardMedia } from "@/components/projects/project-media";
import { SampleLabel } from "@/components/projects/sample-label";
import { CardLink } from "@/components/ui/card";
import type { BaseProject, CardImageFit, ProjectCategory } from "@/lib/projects/types";

type ProjectCardProps = {
  project: BaseProject;
  category: ProjectCategory;
  href: string;
  /** Defaults to `cover`. SaaS & Dashboards passes `contain` so a dashboard stays recognizable. */
  imageFit?: CardImageFit;
  headingLevel?: 3 | 4;
};

/** One link per card. Shows only the title, summary, category, and media; never tools, period, or status. */
export function ProjectCard({
  project,
  category,
  href,
  imageFit = "cover",
  headingLevel = 3,
}: ProjectCardProps) {
  return (
    <CardLink
      href={href}
      headingLevel={headingLevel}
      title={project.title}
      description={project.summary}
      label={category.name}
      hiddenContext={category.name}
      media={
        <div className="flex flex-col gap-3">
          <ProjectCardMedia project={project} fit={imageFit} />
          {project.sample ? <SampleLabel /> : null}
        </div>
      }
      className="h-full"
    />
  );
}
