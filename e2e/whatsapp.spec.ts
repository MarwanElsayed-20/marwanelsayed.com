import { expect, test } from "./fixtures";
import { contactDetails } from "../src/content/site/contact";
import { openMenu, primaryNav } from "./helpers/menu";

const chat = `https://wa.me/${contactDetails.whatsapp}`;

for (const path of ["/", "/work", "/about"])
  test(`${path} has the sticky WhatsApp button, a chat link that never calls`, async ({ page }) => {
    await page.goto(path);
    const button = page.locator("[data-whatsapp-button]");
    await expect(button).toHaveAttribute("href", chat);
    await expect(button).toHaveAttribute("target", "_blank");
    await expect(button).toBeVisible();
    expect(await page.locator("a[href^='tel:']").count()).toBe(0);
    const box = await button.boundingBox();
    const view = page.viewportSize()!;
    expect(box!.x + box!.width).toBeLessThanOrEqual(view.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(view.height);
  });

test("the button steps aside while the menu is open, and the menu lists WhatsApp", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openMenu(page);
  await expect(page.locator("[data-whatsapp-button]")).toHaveCSS("opacity", "0");
  await expect(page.locator("[data-menu-root]").locator(`a[href="${chat}"]`)).toHaveCount(1);
  await expect(primaryNav(page).getByRole("link", { name: "Contact" })).toHaveCount(0);
});

test("the footer, the contact band and the About page link to the same chat", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`#contact a[href="${chat}"]`)).toHaveCount(1);
  await expect(page.locator(`footer a[href="${chat}"]`)).toHaveCount(1);
  await page.goto("/about");
  await expect(page.locator(`main a[href="${chat}"]`)).toHaveCount(1);
});

test.describe("with entrance motion", () => {
  // The page controller marks the footer as uncovered only when motion is on.
  test.use({ entranceMotion: true });

  test("the button leaves once the footer, which has the link, is uncovered", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
    await expect(page.locator("[data-whatsapp-button]")).toHaveCSS("opacity", "0", {
      timeout: 10_000,
    });
  });
});
