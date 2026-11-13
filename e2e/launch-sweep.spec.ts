import { openMenu } from "./helpers/menu";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";
import { openWithPausedHero, pauseHeroForAudit } from "./helpers/hero";
import { ALL_PAGES } from "./helpers/pages";
import { advanceFocus, FOCUSABLE, hasControlOnlyTabbing } from "./helpers/keyboard";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const WIDTHS = [320, 375, 414, 600, 767, 768, 900, 1024, 1440];

for (const path of ALL_PAGES) {
  test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
    test.slow(); // Full-page audits with software WebGL can exceed 30 seconds on Windows.
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await pauseHeroForAudit(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`no WCAG 2.2 AA violations on ${path} with the menu open`, async ({ page }) => {
    test.slow(); // Full-page audits with software WebGL can exceed 30 seconds on Windows.
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await openMenu(page);
    await pauseHeroForAudit(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`keyboard walk on ${path}: skip link first, every stop visible, no trap`, async ({
    page,
    browserName,
  }) => {
    test.slow(); // Software WebGL can delay a complete keyboard walk on Windows.
    await openWithPausedHero(page, path);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    // Keep link focus checks on Windows WebKit, whose native Tab policy skips implicit links.
    const targets = hasControlOnlyTabbing(browserName)
      ? (await page.locator(FOCUSABLE).all()).slice(1)
      : null;
    const seen = new Set<string>();
    for (let step = 0; step < (targets?.length ?? 80); step += 1) {
      if (targets) await advanceFocus(page, targets[step], browserName);
      else await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element || element === document.body) return null;
        const box = element.getBoundingClientRect();
        return {
          key: `${element.tagName}:${element.getAttribute("href") ?? element.textContent?.trim().slice(0, 30) ?? ""}`,
          visible: box.width > 0 && box.height > 0,
        };
      });
      if (stop === null) break;
      expect(stop.visible, stop.key).toBe(true);
      seen.add(stop.key);
    }
    expect([...seen].some((key) => key.endsWith(":/#contact"))).toBe(true);
  });

  test(`no horizontal overflow on ${path} at every reviewed width`, async ({ page }) => {
    test.slow(); // Nine widths, each a page load, can pass 30 seconds on Windows.
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows, `${path} at ${width}px`).toBe(false);
    }
  });

  test(`${path} reflows at 200% text size`, async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(path);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test(`${path} is usable in forced-colors mode`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link").first()).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });

  test(`${path} runs no animation when reduced motion is preferred`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForTimeout(500);
    const running = await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.playState === "running").length,
    );
    expect(running).toBe(0);
  });
}
