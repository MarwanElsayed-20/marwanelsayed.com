import type { Metadata } from "next";
import { ProjectListing } from "@/components/projects/project-listing";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { digitalProducts } from "@/config/projects";
import { sampleProducts } from "@/content/projects/product-samples";
import { reviewBasePath } from "./review-path";

// robots (noindex, nofollow) comes from the review layout; do not set it here.
export const metadata: Metadata = { title: "SaaS & Dashboards (review)" };

export default function ReviewProductListingPage() {
  return (
    <>
      <PlaceholderNotice />
      <ProjectListing
        section={digitalProducts}
        projects={sampleProducts}
        basePath={reviewBasePath}
      />
    </>
  );
}
