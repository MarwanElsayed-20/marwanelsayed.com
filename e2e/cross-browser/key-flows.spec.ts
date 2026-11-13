import { expect, test } from "../fixtures";
import { navItems } from "../../src/config/navigation";
import { headerAction } from "../helpers/hero";
import { openMenu, primaryNav } from "../helpers/menu";
import { NOT_FOUND_PATH, PUBLIC_PAGES } from "../helpers/pages";

// These key flows run in Chromium, Firefox and WebKit (see playwright.config.ts).
// They assert content, navigation and layout, never the 3D scene itself.

for (const width of [320, 768, 1280]) {
  for (const path of PUBLIC_PAGES) {
    test(`${path} has the page landmarks, one h1, and no overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflows).toBe(false);
    });
  }
}

for (const item of navItems.filter((candidate) => candidate.href !== "/")) {
  test(`the desktop menu reaches ${item.label}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await openMenu(page);
    await primaryNav(page).getByRole("link", { name: item.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${item.href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`the phone menu reaches ${item.label}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await openMenu(page);
    await primaryNav(page).getByRole("link", { name: item.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${item.href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("the skip link is the first tab stop and moves focus to the main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.getByRole("main")).toBeFocused();
});

test("an unknown address shows the not-found page with a way forward", async ({ page }) => {
  const response = await page.goto(NOT_FOUND_PATH);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

test("the home page keeps its content and action without the 3D scene", async ({ page }) => {
  await page.goto("/?hero=fallback");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(headerAction(page)).toBeVisible();
  await expect(page.getByRole("main").locator("section#selected-work")).toBeVisible();
});

test("with reduced motion preferred, the home page renders all of its content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(headerAction(page)).toBeVisible();
  await expect(page.getByRole("main").locator("section#selected-work")).toBeVisible();
});

test.describe("scripting disabled", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 800 } });

  test("navigation links and page content remain available", async ({ page }) => {
    await page.goto("/#services");
    await expect(
      page.getByRole("heading", { level: 2, name: "What I can build for you" }),
    ).toBeVisible();
    const links = primaryNav(page).getByRole("link");
    await expect(links).toHaveCount(navItems.length);
    await expect(links.first()).toBeVisible();
  });
});
