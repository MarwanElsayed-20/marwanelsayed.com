import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const PATHS = [
  "/design-system/about",
  "/design-system/about/empty",
  "/design-system/contact",
  "/design-system/contact/empty",
  "/design-system/error-sample",
];

for (const path of PATHS) {
  test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${path} has no horizontal overflow at 320px and 768px`, async ({ page }) => {
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows, `${path} at ${width}px`).toBe(false);
    }
  });

  test(`${path} supports keyboard navigation through the footer`, async ({ page }) => {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    let reachedFooter = false;
    let reachedEnd = false;
    for (let step = 0; step < 80; step += 1) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return null;
        const box = element.getBoundingClientRect();
        return { visible: box.width > 0 && box.height > 0, footer: !!element.closest("footer") };
      });
      if (stop === null) {
        reachedEnd = true;
        break;
      }
      expect(stop.visible).toBe(true);
      reachedFooter ||= stop.footer;
    }
    expect(reachedFooter).toBe(true);
    expect(reachedEnd).toBe(true);
  });

  test(`${path} reflows with 200% text`, async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(path);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false);
  });

  test(`${path} stays usable with forced colors and reduced motion`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: path.includes("error") ? 1 : 2 }).first(),
    ).toBeVisible();
    await expect(page.getByRole("main").getByRole("link").first()).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getAnimations().filter((animation) => animation.playState === "running")
              .length,
        ),
      )
      .toBe(0);
  });
}
