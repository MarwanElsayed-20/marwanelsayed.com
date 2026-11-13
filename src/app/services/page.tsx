import { ServicesPage } from "@/components/site/services-page";
import { resolvedServices } from "@/lib/projects/services";
import { metadataFor } from "@/lib/site-pages";

export const metadata = metadataFor("services");

export default function ServicesRoute() {
  return <ServicesPage services={resolvedServices} />;
}
