"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { reportClientError } from "@/lib/track/send";

type ErrorPageProps = {
  error: Error & { digest?: string };
  /** Older retry function. */
  reset: () => void;
  /** Current retry function that re-fetches the route. */
  retry?: () => void;
  /** Newer retry function that re-fetches the route (Next.js 16.2 and later). */
  unstable_retry?: () => void;
};

/** What the owner's dashboard is told when a page fails: the message and Next's error digest. */
export function pageFailure(error: Error & { digest?: string }): string {
  const digest = error.digest ? ` (digest ${error.digest})` : "";
  return `Page failed to load: ${error.message || "no message"}${digest}`;
}

/**
 * Shown inside the normal site shell when a page fails unexpectedly. It exposes no details to the
 * visitor; the owner's dashboard is told what happened.
 */
export default function ErrorPage({ error, reset, retry, unstable_retry }: ErrorPageProps) {
  const recover = retry ?? unstable_retry ?? reset;
  useEffect(() => reportClientError(pageFailure(error)), [error]);
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
