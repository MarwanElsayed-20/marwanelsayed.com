import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const routes = [
  "/design-system/compositions/landing",
  "/design-system/compositions/listing",
  "/design-system/compositions/detail",
];

for (const route of routes) {
  test.describe(route, () => {
    test("loads, is not indexable, and has a single h1", async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByText("Placeholder content.")).toBeVisible();
    });

    for (const width of [320, 768, 1440]) {
      test(`no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflows).toBe(false);
      });
    }

    test("no horizontal overflow at 200% text size", async ({ page }) => {
      await page.setViewportSize({ width: 720, height: 450 });
      await page.goto(route);
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });

    test("every card has exactly one link", async ({ page }) => {
      await page.goto(route);
      const cards = page.locator("article");
      const count = await cards.count();
      for (let i = 0; i < count; i += 1) {
        await expect(cards.nth(i).getByRole("link")).toHaveCount(1);
      }
    });

    test("transitions are disabled when reduced motion is requested", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      const durations = await page
        .locator("a, button, article")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDuration));
      expect(durations.length).toBeGreaterThan(0);
      expect(
        durations.every((value) => value.split(",").every((part) => part.trim() === "0s")),
      ).toBe(true);
    });

    test("no WCAG 2.2 AA violations", async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
