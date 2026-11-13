import { expect, test } from "../fixtures";
import { expectCaseStudy } from "../helpers/case-study";
import { sampleProjects } from "../../src/content/projects/samples";
for (const project of sampleProjects) {
  test(`review case study: ${project.slug}`, async ({ page }) => {
    const response = await page.goto(`/design-system/digital-experiences/${project.slug}`);
    expect(response?.status()).toBe(200);
    await expectCaseStudy(page, project, "digital-experiences");
    await expect(page.getByText("Sample content")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    if (!project.image)
      await expect(page.locator("article header [data-preview-frame]")).toHaveCount(1);
  });
}
