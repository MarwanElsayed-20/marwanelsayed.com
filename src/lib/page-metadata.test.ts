import { afterEach, describe, expect, it, vi } from "vitest";
import { pageMetadata } from "./page-metadata";

describe("pageMetadata", () => {
  const metadata = pageMetadata({ title: "A title", description: "A description.", index: false });

  it("carries the page's own title and description into link previews", () => {
    expect(metadata.title).toBe("A title");
    expect(metadata.description).toBe("A description.");
    expect(metadata.openGraph).toMatchObject({ title: "A title", description: "A description." });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "A title",
      description: "A description.",
    });
  });

  it("follows the index flag", () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(pageMetadata({ title: "t", description: "d", index: true }).robots).toEqual({
      index: true,
      follow: true,
    });
  });

  it("leaves public image ownership to the file routes and page adapter", () => {
    const publicMetadata = pageMetadata({
      title: "Title",
      description: "Description",
      index: true,
    });
    expect(publicMetadata.openGraph).not.toHaveProperty("images");
    expect(publicMetadata.twitter).not.toHaveProperty("images");
  });

  it("clears inherited images for non-public pages", () => {
    expect(metadata.openGraph).toHaveProperty("images", []);
    expect(metadata.twitter).toHaveProperty("images", []);
  });
});

describe("pageMetadata canonical address", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const input = {
    title: "Title",
    description: "Description.",
    index: true,
    path: "/websites-ecommerce/example",
  };

  it("adds no canonical address when there is no site origin", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    const metadata = pageMetadata(input);
    expect(metadata.alternates).toBeUndefined();
    expect(Object.keys(metadata.openGraph ?? {})).not.toContain("url");
  });

  it("adds the canonical address and sharing address from SITE_URL", () => {
    vi.stubEnv("SITE_URL", "https://studio.co.uk/");
    vi.stubEnv("VERCEL_ENV", "");
    const metadata = pageMetadata(input);
    expect(metadata.alternates?.canonical).toBe("https://studio.co.uk/websites-ecommerce/example");
    expect(metadata.openGraph).toMatchObject({
      url: "https://studio.co.uk/websites-ecommerce/example",
    });
  });

  it("never adds a canonical address on a preview deployment", () => {
    vi.stubEnv("SITE_URL", "https://studio.co.uk");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(pageMetadata(input).alternates).toBeUndefined();
  });

  it("prevents indexing public pages on a preview deployment", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(pageMetadata(input).robots).toEqual({ index: false, follow: true });
  });

  it("adds no canonical address when no path is given", () => {
    vi.stubEnv("SITE_URL", "https://studio.co.uk");
    vi.stubEnv("VERCEL_ENV", "");
    expect(pageMetadata({ title: "T", description: "D", index: true }).alternates).toBeUndefined();
  });

  it("accepts an absolute title and uses its text in link previews", () => {
    vi.stubEnv("SITE_URL", "");
    const metadata = pageMetadata({ title: { absolute: "Studio" }, description: "D", index: true });
    expect(metadata.title).toEqual({ absolute: "Studio" });
    expect(metadata.openGraph).toMatchObject({ title: "Studio" });
    expect(metadata.twitter).toMatchObject({ title: "Studio" });
  });
});
