import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const background = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).backgroundColor);

test("the style guide loads, is not indexable, and has the expected sections", async ({ page }) => {
  const response = await page.goto("/design-system");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1, name: "Design system" })).toBeVisible();
  for (const name of [
    "Color",
    "Typography",
    "Spacing, widths, and radii",
    "Motion",
    "Components",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
});

test("every documented contrast pair is computed and meets its minimum", async ({ page }) => {
  await page.goto("/design-system");
  const rows = page.locator("[data-contrast-row]");
  expect(await rows.count()).toBeGreaterThan(10);
  const data = await rows.evaluateAll((items) =>
    items.map((item) => ({
      ratio: Number(item.getAttribute("data-ratio")),
      min: Number(item.getAttribute("data-min")),
    })),
  );
  for (const row of data) {
    expect(row.ratio).toBeGreaterThanOrEqual(row.min);
  }
});

test("buttons show distinct hover, active, focus, and disabled states", async ({ page }) => {
  await page.goto("/design-system");
  const primary = page.getByRole("button", { name: "Primary", exact: true });
  await primary.scrollIntoViewIfNeeded();

  const normal = await background(primary);
  await primary.hover();
  const hovered = await background(primary);
  expect(hovered).not.toBe(normal);

  await page.mouse.down();
  const pressed = await primary.evaluate((el) => getComputedStyle(el).translate);
  expect(pressed).not.toBe("none");
  await page.mouse.up();

  await page.mouse.move(0, 0);
  await primary.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const outline = await primary.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");

  const disabled = page.getByRole("button", { name: "Disabled primary" });
  await expect(disabled).toBeDisabled();
  const before = await background(disabled);
  await disabled.hover({ force: true });
  expect(await background(disabled)).toBe(before);
});

test("the interactive card has exactly one link and a visible focus outline", async ({ page }) => {
  await page.goto("/design-system");
  const card = page.locator("article", { hasText: "Interactive card" });
  await expect(card.getByRole("link")).toHaveCount(1);
  await card.getByRole("link").focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const outline = await card.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test("keyboard focus is visible on every interactive element", async ({ page }) => {
  await page.goto("/design-system");
  const count = await page.locator("a[href]:visible, button:visible:not([disabled])").count();
  for (let i = 0; i < count; i += 1) {
    await page.keyboard.press("Tab");
    const visible = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      const own = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
      const card = el.closest("article");
      const cardOutline = card ? getComputedStyle(card).outlineStyle !== "none" : false;
      return own || cardOutline;
    });
    expect(visible).toBe(true);
  }
});

test("focus stays visible in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/design-system");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as HTMLElement);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  });
  expect(outline).toBe(true);
});

test("no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/design-system");
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});

test("an image without alt text is detected by the scan (sanity check)", async ({ page }) => {
  await page.goto("/design-system");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const img = document.createElement("img");
    img.src =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" /></svg>';
    img.width = 32;
    img.height = 32;
    img.id = "missing-alt-fixture";
    document.querySelector("main")?.prepend(img);
    await img.decode();
  });
  await expect(page.locator("#missing-alt-fixture")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations.some((violation) => violation.id === "image-alt")).toBe(true);
});
