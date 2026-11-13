import { expect, test } from "./fixtures";

const SIZES = [
  { width: 1704, height: 845 },
  { width: 1280, height: 600 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

for (const size of SIZES) {
  test(`the first screen holds the whole hero, down to the labels, at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/?hero=fallback");
    const label = page.locator("[data-hero-label]").first();
    await expect(label).toBeAttached();
    const bottoms = await page
      .locator("[data-hero-label]")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
    expect(Math.max(...bottoms)).toBeLessThanOrEqual(size.height);
    const stage = await page.locator("[data-hero-stage]").boundingBox();
    expect(stage!.height).toBeGreaterThan(100);
  });
}

test("the header is not sticky: it scrolls away with the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/?hero=fallback");
  const header = page.locator("[data-site-header]");
  expect(await header.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  const box = await header.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(0);
});

test("the page has its own scroll bar and the system one is hidden", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/?hero=fallback");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe(
    "none",
  );
  const track = page.locator("[data-scrollbar]");
  await expect(track).toHaveAttribute("data-active", "true");
  const thumb = page.locator("[data-scrollbar-thumb]");
  const before = await thumb.boundingBox();
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
  await expect.poll(async () => (await thumb.boundingBox())!.y).toBeGreaterThan(before!.y + 5);
});

test("dragging the scroll bar thumb scrolls the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/?hero=fallback");
  const thumb = page.locator("[data-scrollbar-thumb]");
  const box = await thumb.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2 + 120, { steps: 6 });
  await page.mouse.up();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
});

test("in the open menu only the list scrolls, the overlay and its close button stay put", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1280, height: 420 });
  await page.goto("/?hero=fallback");
  await page.getByRole("button", { name: "Menu" }).click();
  const close = page.getByRole("button", { name: "Close menu" });
  await expect(close).toBeVisible();
  const before = await close.boundingBox();
  const state = await page.evaluate(() => {
    const root = document.querySelector("[data-menu-root]") as HTMLElement;
    const list = document.querySelector("[data-menu-list]") as HTMLElement;
    return {
      rootScrolls: root.scrollHeight > root.clientHeight + 1,
      listScrolls: list.scrollHeight > list.clientHeight + 1,
      bar: list.offsetWidth - list.clientWidth,
    };
  });
  expect(state.rootScrolls).toBe(false);
  expect(state.listScrolls).toBe(true);
  expect(state.bar).toBe(0);
  await page.evaluate(() => {
    (document.querySelector("[data-menu-list]") as HTMLElement).scrollTop = 400;
  });
  const after = await close.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("the menu cannot be opened while a page change is playing", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/?hero=fallback");
  await page.locator("#selected-work [data-scene-text] a").first().click();
  await expect(page.locator("html")).toHaveAttribute("data-page-transition", "true");
  await page.locator("[data-menu-toggle]").click({ force: true, noWaitAfter: true });
  await expect(page.locator("html")).not.toHaveAttribute("data-menu-open", "true");
  await expect(page.locator("html")).not.toHaveAttribute("data-page-transition", "true", {
    timeout: 30_000,
  });
});

test("coming back to a page whose menu was opened earlier does not open the menu", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/?hero=fallback");
  await page.locator("[data-menu-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-menu-open", "true");
  await page.locator("[data-menu-root]").getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/, { timeout: 30_000 });
  await expect(page.locator("html")).not.toHaveAttribute("data-page-transition", "true", {
    timeout: 30_000,
  });
  await page
    .locator("[data-site-header]")
    .getByRole("link", { name: /marwan elsayed/i })
    .click();
  await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 30_000 });
  await expect(page.locator("html")).not.toHaveAttribute("data-page-transition", "true", {
    timeout: 30_000,
  });
  await expect(page.locator("[data-menu-toggle]")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("html")).not.toHaveAttribute("data-menu-open", "true");
});
