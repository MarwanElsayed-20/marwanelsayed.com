import { afterEach, expect, it, vi } from "vitest";
import { pageMetadata } from "../page-metadata";
import { projectShareMetadata } from "./project-share-metadata";

afterEach(() => vi.unstubAllEnvs());

it("attaches the one card to Open Graph and Twitter with the complete title as alt", () => {
  vi.stubEnv("SITE_URL", "");
  const path = "/saas-dashboards/aligna";
  const metadata = projectShareMetadata(
    "Aligna",
    path,
    pageMetadata({ title: "Aligna", description: "Description", path, index: true }),
  );
  expect(metadata.openGraph).toMatchObject({
    images: [{ url: `${path}/opengraph-image`, alt: "Aligna", width: 1200, height: 630 }],
  });
  expect(metadata.twitter).toMatchObject({
    card: "summary_large_image",
    images: [{ url: `${path}/opengraph-image`, alt: "Aligna", width: 1200, height: 630 }],
  });
  expect(metadata.alternates).toBeUndefined();
});

it("preserves configured and preview canonical policies", () => {
  const input = {
    title: "Title",
    description: "Description",
    path: "/websites-ecommerce/a",
    index: true,
  };
  vi.stubEnv("SITE_URL", "https://studio.co.uk");
  vi.stubEnv("VERCEL_ENV", "production");
  expect(
    projectShareMetadata(input.title, input.path, pageMetadata(input)).alternates?.canonical,
  ).toBe("https://studio.co.uk/websites-ecommerce/a");
  vi.stubEnv("VERCEL_ENV", "preview");
  const metadata = projectShareMetadata(input.title, input.path, pageMetadata(input));
  expect(metadata.alternates).toBeUndefined();
  expect(metadata.robots).toEqual({ index: false, follow: true });
  expect(metadata.openGraph).not.toHaveProperty("url");
});
