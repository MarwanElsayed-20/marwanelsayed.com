import { expect, test } from "../fixtures";

const LIST = "/design-system/digital-products";

test.describe("mouse", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("hover strengthens the border and underlines the title without moving the layout", async ({
    page,
  }) => {
    await page.goto(LIST);
    const card = page.locator("article").first();
    await card.scrollIntoViewIfNeeded();
    const before = await card.evaluate((el) => ({
      border: getComputedStyle(el).borderTopColor,
      top: el.getBoundingClientRect().top,
    }));
    await card.hover();
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).borderTopColor))
      .not.toBe(before.border);
    await expect(card.getByRole("link")).toHaveCSS("text-decoration-line", "underline");
    const afterTop = await card.evaluate((el) => el.getBoundingClientRect().top);
    expect(afterTop).toBe(before.top);
  });
});

test.describe("keyboard", () => {
  test("each card is one tab stop in reading order and Enter opens it", async ({ page }) => {
    await page.goto(LIST);
    const links = page.locator("article").getByRole("link");
    await expect(links).toHaveCount(6);

    await links.first().focus();
    const indexes: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press("Tab");
      indexes.push(
        await page.evaluate(() => {
          const card = document.activeElement?.closest("article");
          return card ? Array.from(document.querySelectorAll("article")).indexOf(card) : -1;
        }),
      );
    }
    expect(indexes).toEqual([1, 2, 3, 4, 5]);

    // The last tab landed on a card: it shows a visible focus outline.
    await expect(page.locator("article").nth(5)).toHaveCSS("outline-style", "solid");

    await links.first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/design-system\/digital-products\/sample-product-full$/);
  });
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 800 } });

  test("a single tap opens a card", async ({ page }) => {
    await page.goto(LIST);
    await page.getByRole("link", { name: /Sample product: minimal page/ }).tap();
    await expect(page).toHaveURL(/\/design-system\/digital-products\/sample-product-minimal$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Sample product: minimal page",
    );
  });
});

test.describe("reduced motion", () => {
  test("cards and product pages use no transitions or animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of [LIST, `${LIST}/sample-product-full`]) {
      await page.goto(path);
      const result = await page.evaluate(() =>
        Array.from(document.querySelectorAll("article, article a")).map((el) => {
          const style = getComputedStyle(el);
          return { duration: style.transitionDuration, animation: style.animationName };
        }),
      );
      expect(result.length, path).toBeGreaterThan(0);
      expect(
        result.every((r) => r.duration === "0s" && r.animation === "none"),
        path,
      ).toBe(true);
    }
  });
});
