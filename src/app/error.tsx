"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

type ErrorPageProps = {
  error: Error & { digest?: string };
  /** Older retry function. */
  reset: () => void;
  /** Current retry function that re-fetches the route. */
  retry?: () => void;
  /** Newer retry function that re-fetches the route (Next.js 16.2 and later). */
  unstable_retry?: () => void;
};

/** Shown inside the normal site shell when a page fails unexpectedly. It exposes no details. */
export default function ErrorPage({ reset, retry, unstable_retry }: ErrorPageProps) {
  const recover = retry ?? unstable_retry ?? reset;
  return (
    <>
      <PageHeader
        title="Something went wrong"
        intro="An unexpected error stopped this page from loading. You can try again or go back to the home page."
      />
      <Container className="pb-section">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => recover()}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
