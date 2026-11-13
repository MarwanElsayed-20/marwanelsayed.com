import { openMenu } from "./helpers/menu";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";
import { pauseHeroForAudit } from "./helpers/hero";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of ["/", "/this-page-does-not-exist"]) {
  test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
    test.slow(); // Full-page audits with software WebGL can exceed 30 seconds on Windows.
    await page.goto(path);
    await pauseHeroForAudit(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("no WCAG 2.2 AA violations with the menu open", async ({ page }) => {
  test.slow(); // Full-page audits with software WebGL can exceed 30 seconds on Windows.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openMenu(page);
  await pauseHeroForAudit(page);
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});

for (const path of [
  "/websites-ecommerce/hemex-landing-page",
  "/saas-dashboards/toolswift-customer-dashboard",
]) {
  test(`case-study semantics and accessibility: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "On this page", exact: true }).filter({ visible: true }),
    ).toHaveCount(1);
    for (const figure of await page.locator("article figure").all()) {
      await expect(figure.locator("img")).toHaveAttribute("alt", /.+/);
      await expect(figure.locator("figcaption")).not.toBeEmpty();
    }
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
    const back = page.locator("article a").first();
    await back.focus();
    await expect(back).toBeFocused();
    expect(await back.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });
}
