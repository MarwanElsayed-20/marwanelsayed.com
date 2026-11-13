/** First focusable element on every page; lets keyboard users jump past the header. */
export function SkipLink() {
  return (
    <a
      href="#main"
      tabIndex={0}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-1 focus:ring-border"
    >
      Skip to main content
    </a>
  );
}
