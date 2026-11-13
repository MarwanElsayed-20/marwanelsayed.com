import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const LIST = "/design-system/digital-products";
const axeRoutes = [
  LIST,
  `${LIST}/empty`,
  `${LIST}/sample-product-full`,
  `${LIST}/sample-product-minimal`,
  `${LIST}/sample-product-screens`,
];
const layoutRoutes = [
  LIST,
  `${LIST}/sample-product-full`,
  `${LIST}/sample-product-minimal`,
  `${LIST}/sample-product-screens`,
  `${LIST}/sample-product-long`,
];

for (const route of axeRoutes) {
  test(`no WCAG 2.2 AA violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const route of layoutRoutes) {
  for (const width of [320, 768, 1440]) {
    test(`no horizontal overflow on ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(route);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }

  test(`no horizontal overflow on ${route} at 200% text size`, async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(route);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}

test.describe("scripting disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("the sample listing shows every card and link", async ({ page }) => {
    await page.goto(LIST);
    await expect(page.locator("article")).toHaveCount(6);
    await expect(page.locator("article").getByRole("link")).toHaveCount(6);
  });

  test("a product page shows every framed image and outline", async ({ page }) => {
    await page.goto(`${LIST}/sample-product-screens`);
    await expect(page.locator("article figure:visible img")).toHaveCount(7);
    await expect(page.locator("#walkthrough figure:visible figcaption")).toHaveCount(6);
  });
});
