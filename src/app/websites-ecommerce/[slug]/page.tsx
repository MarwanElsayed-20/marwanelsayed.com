import { projectShareMetadata } from "@/lib/share/project-share-metadata";
import { familyFor } from "@/lib/projects/families";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { caseStudyStructuredData } from "@/lib/structured-data";
import { ProjectDetail } from "@/components/projects/project-detail";
import { neighbors } from "@/lib/projects/work";
import { productLabels } from "@/content/projects/work-order";
import { categories, digitalExperiences } from "@/config/projects";
import { pageMetadata } from "@/lib/page-metadata";
import { projects } from "@/lib/projects/repository";
import { findBySlug, projectPath, sectionHomeHref } from "@/lib/projects/select";

type PageProps = { params: Promise<{ slug: string }> };

// An empty list is valid: unknown addresses reach the page, which calls notFound().
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findBySlug(projects, slug);
  if (!project) {
    // File-based image metadata also runs for unmatched dynamic slugs.
    return { openGraph: { images: [] }, twitter: { images: [] } };
  }
  return projectShareMetadata(
    project.title,
    projectPath(digitalExperiences.basePath, project.slug),
    pageMetadata({
      title: project.title,
      description: project.summary,
      index: true,
      path: projectPath(digitalExperiences.basePath, project.slug),
    }),
  );
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findBySlug(projects, slug);
  if (!project) notFound();
  return (
    <>
      <JsonLd
        data={caseStudyStructuredData(
          project,
          projectPath(digitalExperiences.basePath, project.slug),
        )}
      />
      <ProjectDetail
        section={digitalExperiences}
        project={project}
        category={categories[project.category]}
        backHref={sectionHomeHref()}
        productLabel={productLabels[project.slug]}
        family={familyFor(project.slug)}
        neighbors={neighbors(project.slug)}
      />
    </>
  );
}
