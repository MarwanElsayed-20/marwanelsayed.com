import { expect, test } from "./fixtures";

const reviewPaths = [
  "/design-system",
  "/design-system/compositions/landing",
  "/design-system/compositions/listing",
  "/design-system/compositions/detail",
  "/design-system/digital-experiences",
  "/design-system/digital-experiences/empty",
  "/design-system/digital-experiences/sample-full",
];

for (const path of reviewPaths) {
  test(`${path} is not available on the default server`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  });
}

test("public pages never link to review pages", async ({ page }) => {
  for (const path of [
    "/",
    "/websites-ecommerce/mdr-electrical-supply",
    "/this-page-does-not-exist",
  ]) {
    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(hrefs.filter((href) => href.startsWith("/design-system"))).toEqual([]);
  }
});

test("the sample image route is not available on the default server", async ({ request }) => {
  const response = await request.get("/design-system/sample-image/one.svg");
  expect(response.status()).toBe(404);
});

test("public pages contain no sample content or sample images", async ({ page }) => {
  for (const path of [
    "/",
    "/websites-ecommerce/mdr-electrical-supply",
    "/websites-ecommerce/does-not-exist",
  ]) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toContain("Sample content");
    expect(html, path).not.toContain("sample-image");
    expect(html, path).not.toContain("Sample project");
  }
});

const productReviewPaths = [
  "/design-system/digital-products",
  "/design-system/digital-products/empty",
  "/design-system/digital-products/sample-product-full",
];

for (const path of productReviewPaths) {
  test(`${path} is not available on the default server`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  });
}

test("the product sample images are not available on the default server", async ({ request }) => {
  for (const name of ["dashboard.svg", "screen-narrow.svg"]) {
    const response = await request.get(`/design-system/sample-image/${name}`);
    expect(response.status(), name).toBe(404);
  }
});

test("public product pages contain no sample content and never link to review pages", async ({
  page,
}) => {
  for (const path of ["/saas-dashboards/smooth-erp", "/saas-dashboards/does-not-exist"]) {
    await page.goto(path);
    const html = await page.content();
    expect(html, path).not.toContain("Sample content");
    expect(html, path).not.toContain("sample-image");
    expect(html, path).not.toContain("Sample product");
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(
      hrefs.filter((href) => href.startsWith("/design-system")),
      path,
    ).toEqual([]);
  }
});
