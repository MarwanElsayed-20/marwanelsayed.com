import { expect, test } from "../fixtures";

test("an unexpected error shows the branded error page without technical detail", async ({
  page,
}) => {
  await page.goto("/design-system/error-sample");
  await expect(page.getByRole("heading", { level: 1, name: "Something went wrong" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Intentional error");
});

test("the way home from the error page works", async ({ page }) => {
  await page.goto("/design-system/error-sample");
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
