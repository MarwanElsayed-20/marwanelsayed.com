import type { Metadata } from "next";
import { ProjectListing } from "@/components/projects/project-listing";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { digitalProducts } from "@/config/projects";
import { reviewBasePath } from "../review-path";

export const metadata: Metadata = { title: "SaaS & Dashboards empty state (review)" };

export default function ReviewProductEmptyPage() {
  return (
    <>
      <PlaceholderNotice />
      <ProjectListing section={digitalProducts} projects={[]} basePath={reviewBasePath} />
    </>
  );
}
