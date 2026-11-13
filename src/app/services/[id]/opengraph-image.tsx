import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { resolvedServices } from "@/lib/projects/services";
import { shareImage } from "@/lib/share/share-image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export function generateStaticParams() {
  return resolvedServices.map(({ id }) => ({ id }));
}
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = resolvedServices.find((entry) => entry.id === id);
  if (!service) notFound();
  return shareImage({
    ownerName: site.name,
    title: service.name,
    line: service.page.description,
    sectionLabel: "Services",
  });
}
