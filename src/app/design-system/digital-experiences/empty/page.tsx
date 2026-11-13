import type { Metadata } from "next";
import { ProjectListing } from "@/components/projects/project-listing";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { digitalExperiences } from "@/config/projects";
import { reviewBasePath } from "../review-path";

export const metadata: Metadata = { title: "Websites & E-commerce empty state (review)" };

export default function ReviewEmptyPage() {
  return (
    <>
      <PlaceholderNotice />
      <ProjectListing section={digitalExperiences} projects={[]} basePath={reviewBasePath} />
    </>
  );
}
