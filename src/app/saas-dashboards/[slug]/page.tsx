import { projectShareMetadata } from "@/lib/share/project-share-metadata";
import { familyFor } from "@/lib/projects/families";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { caseStudyStructuredData } from "@/lib/structured-data";
import { ProductDetail } from "@/components/projects/product-detail";
import { neighbors } from "@/lib/projects/work";
import { productLabels } from "@/content/projects/work-order";
import { categories, digitalProducts } from "@/config/projects";
import { pageMetadata } from "@/lib/page-metadata";
import { productProjects } from "@/lib/projects/repository";
import { findBySlug, projectPath, sectionHomeHref } from "@/lib/projects/select";

type PageProps = { params: Promise<{ slug: string }> };

// An empty list is valid: unknown addresses reach the page, which calls notFound().
export function generateStaticParams() {
  return productProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findBySlug(productProjects, slug);
  if (!project) {
    // File-based image metadata also runs for unmatched dynamic slugs.
    return { openGraph: { images: [] }, twitter: { images: [] } };
  }
  return projectShareMetadata(
    project.title,
    projectPath(digitalProducts.basePath, project.slug),
    pageMetadata({
      title: project.title,
      description: project.summary,
      index: true,
      path: projectPath(digitalProducts.basePath, project.slug),
    }),
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findBySlug(productProjects, slug);
  if (!project) notFound();
  return (
    <>
      <JsonLd
        data={caseStudyStructuredData(project, projectPath(digitalProducts.basePath, project.slug))}
      />
      <ProductDetail
        section={digitalProducts}
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
