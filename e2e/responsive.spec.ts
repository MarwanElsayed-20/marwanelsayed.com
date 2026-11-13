import { expect, test } from "./fixtures";

for (const width of [320, 768, 1440]) {
  test(`no horizontal overflow and shell visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);

    for (const role of ["banner", "main", "contentinfo"] as const) {
      const box = await page.getByRole(role).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  });
}

for (const path of [
  "/websites-ecommerce/hemex-landing-page",
  "/saas-dashboards/toolswift-customer-dashboard",
]) {
  for (const width of [360, 768, 1440])
    test(`detail has no overflow: ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ),
      ).toBe(false);
      if (width < 1024) {
        const details = page.locator("[data-case-study-outline] details");
        await expect(details).toBeVisible();
        await details.locator("summary").focus();
        await page.keyboard.press("Enter");
        await expect(details).toHaveAttribute("open", "");
        await details.getByRole("link").first().click();
        await expect(page.locator("#overview-heading")).toBeInViewport();
      } else {
        // Wide: the chapters sit in one row under the hero, each a link to its section.
        const strip = page.locator("[data-case-study-outline] nav").filter({ visible: true });
        await expect(strip).toHaveCount(1);
        const links = strip.getByRole("link");
        expect(await links.count()).toBeGreaterThan(1);
        const tops = await links.evaluateAll((items) =>
          items.map((item) => Math.round(item.getBoundingClientRect().top)),
        );
        expect(new Set(tops).size).toBe(1);
      }
    });
}
