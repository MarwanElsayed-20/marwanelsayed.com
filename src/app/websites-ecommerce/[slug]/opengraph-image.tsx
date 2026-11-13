import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { digitalExperiences } from "@/config/projects";
import { projects } from "@/lib/projects/repository";
import { shareCapture } from "@/lib/share/share-card";
import { shareImage } from "@/lib/share/share-image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  return shareImage({
    ownerName: site.name,
    title: project.title,
    line: project.summary,
    sectionLabel: digitalExperiences.name,
    capture: shareCapture(project),
  });
}
