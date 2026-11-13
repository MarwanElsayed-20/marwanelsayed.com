import { expect, test, type Page } from "./fixtures";
import { expectMenuClosed, menuToggle, openMenu, primaryNav } from "./helpers/menu";

async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

for (const [label, viewport] of [
  ["narrow", { width: 375, height: 800 }],
  ["wide", { width: 1280, height: 800 }],
] as const) {
  test.describe(`${label} viewport`, () => {
    test.use({ viewport });

    test("the menu is closed by default and the button opens and closes it", async ({ page }) => {
      test.slow(); // Repeated clicks can wait on software WebGL rendering on Windows.
      await open(page);
      const link = primaryNav(page).getByRole("link", { name: "Home" });
      await expect(menuToggle(page)).toHaveAttribute("aria-expanded", "false");
      await expect(menuToggle(page)).toHaveText("Menu");
      await expect(link).toBeHidden();

      await openMenu(page);
      await expect(link).toBeVisible();

      await page.getByRole("button", { name: "Close menu" }).click();
      await expectMenuClosed(page);
      await expect(menuToggle(page)).toHaveText("Menu");
    });

    test("Escape closes the menu and returns focus to the button", async ({ page }) => {
      test.slow();
      await open(page);
      await menuToggle(page).focus();
      await page.keyboard.press("Enter");
      await expect(menuToggle(page)).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expectMenuClosed(page);
      await expect(menuToggle(page)).toBeFocused();
    });

    test("while open the page cannot scroll, the content is inert and focus stays inside", async ({
      page,
    }) => {
      test.slow();
      await open(page);
      await openMenu(page);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
        "hidden",
      );
      await expect(page.locator("[data-page-shell]")).toHaveAttribute("inert", "");
      await expect(primaryNav(page).getByRole("link").first()).toBeFocused();
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press("Tab");
        expect(
          await page.evaluate(() => document.activeElement?.closest("[data-menu-root]") !== null),
        ).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expectMenuClosed(page);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
        "visible",
      );
      await expect(page.locator("[data-page-shell]")).not.toHaveAttribute("inert", "");
    });

    test("choosing a destination closes the menu and lands on it", async ({ page }) => {
      test.slow();
      await open(page);
      await openMenu(page);
      await primaryNav(page).getByRole("link", { name: "About", exact: true }).click();
      // The page card plays its transition first; the menu is gone once the new page is in.
      await expect(page).toHaveURL(/\/about$/, { timeout: 20_000 });
      await expectMenuClosed(page);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("the current section is marked inside the menu, and unknown pages have none", async ({
      page,
    }) => {
      test.slow();
      await open(page, "/");
      await openMenu(page);
      await expect(
        primaryNav(page).getByRole("link", { name: "Home", exact: true }),
      ).toHaveAttribute("aria-current", "location");
      await open(page, "/this-page-does-not-exist");
      await expect(primaryNav(page).locator("[aria-current]")).toHaveCount(0);
    });
  });
}

test.describe("scripting disabled", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 800 } });

  test("the links are visible and the menu button is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(menuToggle(page)).toBeHidden();
    await expect(primaryNav(page).getByRole("link", { name: "Home" })).toBeVisible();
  });
});

for (const width of [320, 375, 414, 600, 767, 768, 900, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}

test("the menu lists no Contact entry, and Get in touch focuses the contact section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openMenu(page);
  await expect(primaryNav(page).locator('a[href="/#contact"]')).toHaveCount(0);
  await expect(primaryNav(page).getByRole("link", { name: "Contact" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.locator("[data-menu-contact]").click();
  await expect(page.locator("#contact")).toBeFocused();
});

test("the menu names the ToolSwift ecosystem and Smooth ERP, and shows no email", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openMenu(page);
  const projects = page.getByRole("navigation", { name: "Selected projects" });
  await expect(projects.getByRole("link")).toHaveText(["ToolSwift", "Smooth ERP", "Aligna"]);
  await expect(page.locator("[data-menu-root] a[href^='mailto:']")).toHaveCount(0);
});

for (const width of [390, 1440, 2560])
  test(`the header mark lines up with the header buttons at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
    const mark = await box("header a[href='/'] svg");
    const menu = await box("[data-menu-toggle]");
    expect(Math.abs(mark.y - menu.y)).toBeLessThan(1);
    expect(Math.abs(mark.y + mark.height - (menu.y + menu.height))).toBeLessThan(1);
  });

test("direct hashes focus their section", async ({ page }) => {
  await page.goto("/#services");
  const initialSection = page.locator("#services");
  await expect(initialSection).toBeFocused();
  // Focus can arrive before the browser finishes initial hash positioning.
  await expect
    .poll(() => initialSection.evaluate((el) => Math.abs(el.getBoundingClientRect().top - 24)))
    .toBeLessThan(1);
});

test("normal-motion navigation across the whole page completes within one second", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const elapsed = await page.evaluate(
    () =>
      new Promise<number | null>((resolve) => {
        const target = document.getElementById("contact")!;
        const started = performance.now();
        const timeout = setTimeout(() => resolve(null), 990);
        const check = () => {
          if (
            Math.abs(target.getBoundingClientRect().top - 24) < 1 &&
            document.activeElement === target
          ) {
            clearTimeout(timeout);
            resolve(performance.now() - started);
          } else if (performance.now() - started < 990) requestAnimationFrame(check);
        };
        document.querySelector<HTMLAnchorElement>("[data-menu-contact]")!.click();
        requestAnimationFrame(check);
      }),
  );
  expect(elapsed).not.toBeNull();
  expect(elapsed!).toBeLessThan(1000);
});
