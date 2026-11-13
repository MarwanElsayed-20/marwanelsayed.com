import { destinationLinks, NotSupplied } from "@/components/site/not-supplied";

export default function ReviewAboutEmptyPage() {
  return (
    <NotSupplied
      title="About"
      message="This page is being prepared."
      links={destinationLinks("/about")}
    />
  );
}
