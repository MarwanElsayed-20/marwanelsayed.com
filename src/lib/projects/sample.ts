/** Sample images are served by a review-only route. They are never real project images. */
export const SAMPLE_IMAGE_PREFIX = "/design-system/sample-image/";

/** Visible label shown on every card and page that renders sample content. */
export const SAMPLE_LABEL = "Sample content";

export function isSampleImageSrc(src: string): boolean {
  return src.startsWith(SAMPLE_IMAGE_PREFIX);
}
