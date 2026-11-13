import { expect, type Page } from "@playwright/test";

/** Selects the primary navigation even while the full-screen menu is closed (and so hidden). */
export const primaryNav = (page: Page) => page.locator('nav[aria-label="Primary"]');

export const menuToggle = (page: Page) => page.locator("[data-menu-toggle]");

/** Opens the full-screen menu and waits until the page card has settled and the list is shown. */
export async function openMenu(page: Page) {
  const toggle = menuToggle(page);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  // The page slides aside as a card; the staggered list fades in after it. Wait for both.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const shell = document.querySelector<HTMLElement>("[data-page-shell]");
        const lines = [...document.querySelectorAll<HTMLElement>("[data-menu-line]")];
        const root = document.querySelector<HTMLElement>("[data-menu-root]");
        if (!shell || !root) return false;
        const matrix = new DOMMatrixReadOnly(getComputedStyle(shell).transform);
        const settled = Math.abs(matrix.a - 0.9) < 0.002 && Math.abs(matrix.e) > 100;
        return (
          settled &&
          getComputedStyle(root).opacity === "1" &&
          lines.every((line) => getComputedStyle(line).opacity === "1")
        );
      }),
    )
    .toBe(true);
}

/** Waits until the menu has finished closing and is hidden again. */
export async function expectMenuClosed(page: Page) {
  await expect(menuToggle(page)).toHaveAttribute("aria-expanded", "false");
  await expect(primaryNav(page)).toBeHidden({ timeout: 15_000 });
  await expect
    .poll(
      () =>
        page.evaluate(
          () => getComputedStyle(document.querySelector("[data-page-shell]")!).transform === "none",
        ),
      // After a page change the new page is still growing to full size for a moment.
      { timeout: 20_000 },
    )
    .toBe(true);
}
