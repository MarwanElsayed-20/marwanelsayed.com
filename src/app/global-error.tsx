"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/track/send";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
};

/**
 * Last resort when the root layout itself fails. Self-contained: no shared components or styles,
 * only the small signal that tells the owner's dashboard.
 */
export default function GlobalError({ error, reset, retry, unstable_retry }: GlobalErrorProps) {
  const recover = retry ?? unstable_retry ?? reset;
  useEffect(() => {
    const digest = error.digest ? ` (digest ${error.digest})` : "";
    reportClientError(`Site failed to load: ${error.message || "no message"}${digest}`);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "4rem 1.5rem" }}>
        <main style={{ maxWidth: "40rem" }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error stopped this page from loading.</p>
          <p>
            <button type="button" onClick={() => recover()}>
              Try again
            </button>{" "}
            <Link href="/">Back to home</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
