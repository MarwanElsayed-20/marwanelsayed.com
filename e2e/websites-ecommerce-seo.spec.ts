import { expect, test } from "./fixtures";
import { digitalExperiencesProjects as projects } from "../src/content/projects/digital-experiences";
for (const project of projects)
  test(`${project.slug} has detail metadata`, async ({ page }) => {
    const path = `/websites-ecommerce/${project.slug}`;
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
