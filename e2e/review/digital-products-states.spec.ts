import { expect, test } from "../fixtures";

const LIST = "/design-system/digital-products";

test("an offline product omits offline notices and live links", async ({ page }) => {
  await page.goto(`${LIST}/sample-product-offline`);
  await expect(page.getByText("This project is no longer online.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Visit/ })).toHaveCount(0);
  await expect(page.getByText("Opens the live site in a new tab")).toHaveCount(0);
});

test("a product without an image shows a placeholder frame on its page", async ({ page }) => {
  await page.goto(`${LIST}/sample-product-no-image`);
  await expect(page.locator("article img")).toHaveCount(0);
  await expect(page.locator("article header [data-preview-frame]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Overview and scope"]);
});

test("a minimal product is a card and a polished page with only the required parts", async ({
  page,
}) => {
  await page.goto(`${LIST}/sample-product-minimal`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample product: minimal page");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
  await expect(page.locator("article a")).toHaveCount(3);
  await page.goto(LIST);
  await expect(
    page.getByRole("link", { name: "Sample product: minimal page, Dashboards" }),
  ).toHaveAttribute("href", `${LIST}/sample-product-minimal`);
});

test("unknown review product addresses return 404", async ({ page }) => {
  const response = await page.goto(`${LIST}/not-a-sample`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
});

test("every product page image has dimensions and an alt attribute", async ({ page }) => {
  for (const slug of ["sample-product-full", "sample-product-offline", "sample-product-screens"]) {
    await page.goto(`${LIST}/${slug}`);
    const images = page.locator("article img");
    const count = await images.count();
    expect(count, slug).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(images.nth(i)).toHaveAttribute("width", /^\d+$/);
      await expect(images.nth(i)).toHaveAttribute("height", /^\d+$/);
      await expect(images.nth(i)).toHaveAttribute("alt", /.*/);
    }
  }
});

test("a long title and summary wrap on a narrow screen without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${LIST}/sample-product-long`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("deliberately long title");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
