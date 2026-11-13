import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { categories, digitalExperiences } from "@/config/projects";
import { sampleProjects } from "@/content/projects/samples";
import { findBySlug } from "@/lib/projects/select";
import { reviewBasePath } from "../review-path";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findBySlug(sampleProjects, slug);
  return { title: project ? `${project.title} (review)` : "Not found" };
}

export default async function ReviewProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findBySlug(sampleProjects, slug);
  if (!project) notFound();
  return (
    <>
      <PlaceholderNotice />
      <ProjectDetail
        section={digitalExperiences}
        project={project}
        category={categories[project.category]}
        backHref={reviewBasePath}
      />
    </>
  );
}
