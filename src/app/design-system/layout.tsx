import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { reviewPagesEnabled } from "@/lib/review-pages";

// The switch is read on every request, so one production build serves both the
// "absent" and "present" cases (default server versus the test server).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design system",
  openGraph: { images: [] },
  twitter: { images: [] },
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: ReactNode }) {
  if (!reviewPagesEnabled(process.env)) notFound();
  return <>{children}</>;
}
