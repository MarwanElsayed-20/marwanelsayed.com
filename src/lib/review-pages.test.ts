import { describe, expect, it } from "vitest";
import { reviewPagesEnabled } from "./review-pages";

describe("reviewPagesEnabled", () => {
  it("is off by default in a production build", () => {
    expect(reviewPagesEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("is on in development", () => {
    expect(reviewPagesEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("is on in Vercel preview and development environments", () => {
    expect(reviewPagesEnabled({ NODE_ENV: "production", VERCEL_ENV: "preview" })).toBe(true);
    expect(reviewPagesEnabled({ NODE_ENV: "production", VERCEL_ENV: "development" })).toBe(true);
  });

  it("is on when the explicit switch is set outside production", () => {
    expect(reviewPagesEnabled({ NODE_ENV: "production", ENABLE_REVIEW_PAGES: "true" })).toBe(true);
  });

  it("ignores switch values other than the string true", () => {
    expect(reviewPagesEnabled({ NODE_ENV: "production", ENABLE_REVIEW_PAGES: "1" })).toBe(false);
    expect(reviewPagesEnabled({ NODE_ENV: "production", ENABLE_REVIEW_PAGES: "false" })).toBe(
      false,
    );
  });

  it("is always off on Vercel production, even with the switch", () => {
    expect(
      reviewPagesEnabled({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        ENABLE_REVIEW_PAGES: "true",
      }),
    ).toBe(false);
  });
});
