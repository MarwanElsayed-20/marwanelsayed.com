import { expect, test } from "../fixtures";
import { expectCaseStudy } from "../helpers/case-study";
import { sampleProducts } from "../../src/content/projects/product-samples";
for (const project of sampleProducts) {
  test(`review case study: ${project.slug}`, async ({ page }) => {
    const response = await page.goto(`/design-system/digital-products/${project.slug}`);
    expect(response?.status()).toBe(200);
    await expectCaseStudy(page, project, "digital-products");
    await expect(page.getByText("Sample content")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    if (!project.image)
      await expect(page.locator("article header [data-preview-frame]")).toHaveCount(1);
  });
}
