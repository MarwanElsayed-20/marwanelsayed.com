/** Throws on render so a browser test can exercise the real error page. Never linked. */
export default function ErrorSamplePage(): never {
  throw new Error("Intentional error for the review of the error page.");
}
