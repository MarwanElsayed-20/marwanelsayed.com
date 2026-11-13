import { expect, test } from "./fixtures";
import { projects, productProjects } from "../src/lib/projects/repository";

const pages = [
  "/",
  ...projects.map(({ slug }) => `/websites-ecommerce/${slug}`),
  ...productProjects.map(({ slug }) => `/saas-dashboards/${slug}`),
];

test("all 29 public pages have unique metadata and resolving 1200 by 630 cards", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of pages) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(titles.has(title), path).toBe(false);
    expect(descriptions.has(description!), path).toBe(false);
    titles.add(title);
    descriptions.add(description!);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    for (const [attribute, prefix] of [
      ["property", "og"],
      ["name", "twitter"],
    ]) {
      const image = page.locator(`meta[${attribute}="${prefix}:image"]`);
      await expect(image).toHaveCount(1);
      const advertised = new URL((await image.getAttribute("content"))!, page.url());
      // No SITE_URL locally: Next resolves file images against localhost:3000.
      const response = await request.get(
        new URL(advertised.pathname + advertised.search, page.url()).href,
      );
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/^image\/png/);
      const png = await response.body();
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
      const shownTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
      await expect(page.locator(`meta[${attribute}="${prefix}:image:alt"]`)).toHaveAttribute(
        "content",
        shownTitle!,
      );
    }
  }
  expect(titles.size).toBe(29);
});

test("not-found and review routes advertise no images or sitemap membership", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of [
    "/contact",
    "/design-system",
    "/design-system/about",
    "/websites-ecommerce/unknown-launch-016",
    "/saas-dashboards/unknown-launch-016",
  ]) {
    const response = await page.goto(path);
    if (!path.startsWith("/design-system")) expect(response?.status(), path).toBe(404);
    await expect(
      page.locator('meta[property="og:image"],meta[name="twitter:image"]'),
      path,
    ).toHaveCount(0);
    expect(sitemap).not.toContain(`${path}</loc>`);
  }
});
