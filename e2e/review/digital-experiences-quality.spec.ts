import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const LIST = "/design-system/digital-experiences";
const axeRoutes = [LIST, `${LIST}/empty`, `${LIST}/sample-full`, `${LIST}/sample-minimal`];
const layoutRoutes = [
  LIST,
  `${LIST}/sample-full`,
  `${LIST}/sample-minimal`,
  `${LIST}/sample-portrait`,
  `${LIST}/sample-long`,
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

  test("the full sample page shows its sections and image", async ({ page }) => {
    await page.goto(`${LIST}/sample-full`);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Overview and scope",
      "Architecture and decisions",
      "Technologies",
    ]);
    await expect(page.locator("article img")).toHaveCount(1);
  });
});
