import { expect, test } from "./fixtures";

// The hover fill of "Back to Work" is the link's own box, so the box must be as wide as its label,
// not the grid area it sits in (which reaches under the hero image).
for (const width of [390, 768, 1440, 1920])
  test(`Back to Work is only as wide as its label at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/saas-dashboards/aligna");
    const link = page.locator("a.case-back");
    const box = (await link.boundingBox())!;
    const label = await link.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width;
    });
    expect(box.width).toBeLessThan(label + 4);
  });
