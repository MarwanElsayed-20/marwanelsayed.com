import { expect, test } from "./fixtures";
import { digitalProductsProjects as projects } from "../src/content/projects/digital-products";
for (const project of projects)
  test(`${project.slug} has detail metadata`, async ({ page }) => {
    const path = `/saas-dashboards/${project.slug}`;
    await page.goto(path);
    expect(await page.title()).toContain(project.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      project.summary,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^index/);
    const canonical = page.locator('link[rel="canonical"]');
    if (await canonical.count())
      expect(new URL((await canonical.getAttribute("href"))!).pathname).toBe(path);
  });
