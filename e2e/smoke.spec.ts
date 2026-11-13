import { site } from "../src/config/site";
import { expect, test } from "./fixtures";

test("home page loads with the expected structure and no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(`${site.name} | Front-end engineer`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

  expect(consoleErrors).toEqual([]);
});
