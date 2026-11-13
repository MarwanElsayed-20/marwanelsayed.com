import { expect, test } from "./fixtures";

const durations = (page: import("@playwright/test").Page, selector: string) =>
  page
    .locator(selector)
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDuration));

test("transitions are disabled when reduced motion is requested", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const selector = "header a";

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const normal = await durations(page, selector);
  expect(normal.length).toBeGreaterThan(1);
  expect(normal.every((value) => value !== "0s")).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await durations(page, selector);
  expect(reduced.every((value) => value === "0s")).toBe(true);
});

test("section navigation uses no smooth scrolling with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    "auto",
  );
});

test("preview frames do not lift on hover with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?hero=fallback");
  const frame = page.locator("[data-preview-frame]").first();
  await page.evaluate(() => document.fonts.ready);
  await frame.scrollIntoViewIfNeeded();
  await frame.hover();
  expect(await frame.evaluate((el) => getComputedStyle(el).translate)).toBe("none");
  expect(await frame.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
});

test("case-study frames and outline remain usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/websites-ecommerce/hemex-landing-page");
  const frame = page.locator("article header [data-preview-frame]");
  expect(await frame.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  const link = page
    .getByRole("navigation", { name: "On this page", exact: true })
    .filter({ visible: true })
    .getByRole("link", { name: "Walkthrough", exact: true });
  await link.click();
  await expect(page.locator("#walkthrough-heading")).toBeInViewport();
});
test.describe("case study without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("content, outline and project navigation stay readable", async ({ page }) => {
    await page.goto("/websites-ecommerce/hemex-landing-page");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("#walkthrough figure")).not.toHaveCount(0);
    const outline = page
      .getByRole("navigation", { name: "On this page", exact: true })
      .filter({ visible: true });
    await outline.getByRole("link", { name: "Walkthrough", exact: true }).click();
    await expect(page.locator("#walkthrough-heading")).toBeInViewport();
    await expect(page.getByRole("link", { name: /Next project:/ })).toHaveCount(1);
  });
});
