import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/site/service-detail-page";
import { pageMetadata } from "@/lib/page-metadata";
import { resolvedServices } from "@/lib/projects/services";
import { projectShareMetadata } from "@/lib/share/project-share-metadata";

type PageProps = { params: Promise<{ id: string }> };

// Only the four services exist: any other address is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return resolvedServices.map((service) => ({ id: service.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = resolvedServices.find((entry) => entry.id === id);
  if (!service) {
    // File-based image metadata also runs for unmatched dynamic segments.
    return { openGraph: { images: [] }, twitter: { images: [] } };
  }
  // Attaches the card with its alt text, which a file route cannot vary per service.
  return projectShareMetadata(
    service.page.title,
    service.href,
    pageMetadata({
      title: service.page.title,
      description: service.page.description,
      index: true,
      path: service.href,
    }),
  );
}

export default async function ServiceRoute({ params }: PageProps) {
  const { id } = await params;
  const service = resolvedServices.find((entry) => entry.id === id);
  if (!service) notFound();
  return (
    <ServiceDetailPage
      service={service}
      others={resolvedServices.filter((entry) => entry.id !== service.id)}
    />
  );
}
