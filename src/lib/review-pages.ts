type Env = Readonly<Record<string, string | undefined>>;

/**
 * Decides whether the internal style guide and sample compositions exist.
 * Order matters: production on Vercel is always off, even if the switch is set.
 */
export function reviewPagesEnabled(env: Env): boolean {
  if (env.VERCEL_ENV === "production") return false;
  if (env.ENABLE_REVIEW_PAGES === "true") return true;
  if (env.NODE_ENV === "development") return true;
  return env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development";
}
