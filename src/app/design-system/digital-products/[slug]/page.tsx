import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/projects/product-detail";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { categories, digitalProducts } from "@/config/projects";
import { sampleProducts } from "@/content/projects/product-samples";
import { findBySlug } from "@/lib/projects/select";
import { reviewBasePath } from "../review-path";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findBySlug(sampleProducts, slug);
  return { title: project ? `${project.title} (review)` : "Not found" };
}

export default async function ReviewProductPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findBySlug(sampleProducts, slug);
  if (!project) notFound();
  return (
    <>
      <PlaceholderNotice />
      <ProductDetail
        section={digitalProducts}
        project={project}
        category={categories[project.category]}
        backHref={reviewBasePath}
      />
    </>
  );
}
