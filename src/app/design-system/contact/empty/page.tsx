import { destinationLinks, NotSupplied } from "@/components/site/not-supplied";

export default function ReviewContactEmptyPage() {
  return (
    <NotSupplied
      title="Contact"
      message="Contact details are being prepared."
      links={destinationLinks("/contact")}
    />
  );
}
