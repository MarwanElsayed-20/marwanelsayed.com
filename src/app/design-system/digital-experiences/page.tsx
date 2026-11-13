import type { Metadata } from "next";
import { ProjectListing } from "@/components/projects/project-listing";
import { PlaceholderNotice } from "@/components/review/placeholder-notice";
import { digitalExperiences } from "@/config/projects";
import { sampleProjects } from "@/content/projects/samples";
import { reviewBasePath } from "./review-path";

// robots (noindex, nofollow) comes from the review layout; do not set it here.
export const metadata: Metadata = { title: "Websites & E-commerce (review)" };

export default function ReviewListingPage() {
  return (
    <>
      <PlaceholderNotice />
      <ProjectListing
        section={digitalExperiences}
        projects={sampleProjects}
        basePath={reviewBasePath}
      />
    </>
  );
}
