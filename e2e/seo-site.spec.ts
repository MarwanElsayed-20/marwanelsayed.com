import { expect, test } from "./fixtures";
import { digitalExperiencesProjects } from "../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../src/content/projects/digital-products";
import { PUBLIC_PAGES } from "./helpers/pages";

test("every public page has a unique title and description", async ({ page }) => {
  const titles: string[] = [];
  const descriptions: string[] = [];
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const title = await page.title();
    const description =
      (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    expect(title.trim().length, `${path} title`).toBeGreaterThan(0);
    expect(description.trim().length, `${path} description`).toBeGreaterThan(0);
    titles.push(title);
    descriptions.push(description);
  }
  expect(new Set(titles).size).toBe(titles.length);
  expect(new Set(descriptions).size).toBe(descriptions.length);
});

test("indexing follows the content, and a canonical address is never a guess", async ({ page }) => {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const robots = (await page.locator('meta[name="robots"]').getAttribute("content")) ?? "";
    expect(robots, path).toMatch(/^index/);
    const canonical = page.locator('link[rel="canonical"]');
    if ((await canonical.count()) > 0) {
      const href = (await canonical.getAttribute("href")) ?? "";
      expect(href, path).toMatch(/^https:\/\//);
      expect(new URL(href).pathname, path).toBe(path);
    }
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  }
});

test("robots.txt is plain text, allows crawling and never mentions review pages", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const body = await response.text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/Allow: \//i);
  expect(body).not.toMatch(/Disallow:/i);
  expect(body).not.toContain("design-system");
});

test("sitemap.xml lists exactly the indexable public pages, and robots.txt agrees", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()["content-type"]).toContain("xml");
  const body = await sitemap.text();
  expect(body).not.toMatch(/digital-experiences|digital-products/);
  expect(body).not.toContain("design-system");
  const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const robots = await (await request.get("/robots.txt")).text();
  expect(/^Sitemap:/im.test(robots)).toBe(locations.length > 0);

  if (locations.length === 0) return; // No SITE_URL at build time: nothing honest to list.
  for (const location of locations) expect(location).toMatch(/^https:\/\//);
  const paths = locations.map((location) => new URL(location).pathname);
  expect(paths.sort()).toEqual(
    [
      "/",
      ...digitalExperiencesProjects.map((p) => `/websites-ecommerce/${p.slug}`),
      ...digitalProductsProjects.map((p) => `/saas-dashboards/${p.slug}`),
    ].sort(),
  );
});

test("trailing slashes and wrong case never serve a second copy", async ({ page }) => {
  await page.goto("/about/");
  expect(new URL(page.url()).pathname).toBe("/about");
  await page.goto("/saas-dashboards/");
  expect(new URL(page.url()).pathname).toBe("/work");
  const response = await page.goto("/About");
  expect(response?.status()).toBe(404);
});
