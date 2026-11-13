import { expect, test } from "./fixtures";
import { openWithPausedHero } from "./helpers/hero";
import { advanceFocus, FOCUSABLE } from "./helpers/keyboard";

test("skip link is the first tab stop and moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("every focusable element shows a visible focus indicator", async ({ page, browserName }) => {
  test.slow(); // Includes loading the real software-WebGL scene before the keyboard walk.
  await openWithPausedHero(page);
  const targets = await page.locator(FOCUSABLE).all();
  expect(targets.length).toBeGreaterThan(0);

  for (const target of targets) {
    await advanceFocus(page, target, browserName);
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      // CardLink deliberately draws the focus outline on its enclosing card.
      const card = el.closest("article:has(:focus-visible)");
      const styles = [el, ...(card ? [card] : [])].map((element) => {
        const style = getComputedStyle(element);
        return { style: style.outlineStyle, width: style.outlineWidth, shadow: style.boxShadow };
      });
      return {
        focused: el !== document.body && el.matches(":focus-visible"),
        visible: styles.some(
          (style) => (style.style !== "none" && style.width !== "0px") || style.shadow !== "none",
        ),
      };
    });
    expect(outline.focused).toBe(true);
    expect(outline.visible).toBe(true);
  }
});
