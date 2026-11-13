import type { Metadata } from "next";
/** Single-image file routes generate pixels; attach per-project alt text here because
 * Next 16 replaces generateStaticParams when generateImageMetadata is exported. Twitter uses the
 * same Open Graph image: there is one card per page. */
export function projectShareMetadata(title: string, path: string, metadata: Metadata): Metadata {
  const images = [{ url: `${path}/opengraph-image`, width: 1200, height: 630, alt: title }];
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, images },
    twitter: { ...metadata.twitter, images },
  };
}
