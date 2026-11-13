import { expect, test } from "../fixtures";

const LIST = "/design-system/digital-products";

test("the sample listing loads, is not indexable, and has one h1", async ({ page }) => {
  const response = await page.goto(LIST);
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("SaaS & Dashboards");
  await expect(page.getByText("Placeholder content.")).toBeVisible();
});

test("products are grouped under the two categories in the fixed order", async ({ page }) => {
  await page.goto(LIST);
  const groups = await page.getByRole("heading", { level: 2 }).allTextContents();
  expect(groups).toEqual(["SaaS products", "Dashboards"]);
  await expect(page.locator("article")).toHaveCount(6);
});

test("every card is one link, is labelled as sample, and names its category", async ({ page }) => {
  await page.goto(LIST);
  const cards = page.locator("article");
  for (let i = 0; i < 6; i += 1) {
    const card = cards.nth(i);
    await expect(card.getByRole("link")).toHaveCount(1);
    await expect(card.getByText("Sample content")).toBeVisible();
  }
  await expect(
    page.getByRole("link", { name: "Sample product: full page, SaaS products" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sample product: minimal page, Dashboards" }),
  ).toBeVisible();
});

test("cards never show technologies, period, status, or further screens", async ({ page }) => {
  await page.goto(LIST);
  const articles = page.locator("article");
  await expect(articles.getByText("Sample tool one")).toHaveCount(0);
  await expect(articles.getByText("Sample period")).toHaveCount(0);
  await expect(
    articles.getByText("This project is no longer online.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    articles.getByText("Sample summary for a product recorded as no longer online.", {
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(articles.locator('img[alt^="Sample stand-in screen"]')).toHaveCount(0);
});

test("card images are shown whole, lazy, and described", async ({ page }) => {
  await page.goto(LIST);
  const images = page.locator("article img");
  const count = await images.count();
  expect(count).toBe(3);
  for (let i = 0; i < count; i += 1) {
    const img = images.nth(i);
    await expect(img).toHaveCSS("object-fit", "contain");
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("width", /^\d+$/);
    await expect(img).toHaveAttribute("height", /^\d+$/);
    await expect(img).toHaveAttribute("alt", /.+/);
  }
});

test("a card without an image shows the lettered frame and no img", async ({ page }) => {
  await page.goto(LIST);
  const card = page.locator("article", { hasText: "Sample product: no image" });
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator('[aria-hidden="true"]').first()).toHaveText("S");
});

test("the empty page shows the product empty state and no cards", async ({ page }) => {
  const response = await page.goto(`${LIST}/empty`);
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 2, name: "Selected product work is being added" }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("the sample image route serves every SVG here and 404s for unknown names", async ({
  request,
}) => {
  for (const name of ["one.svg", "two.svg", "three.svg", "dashboard.svg", "screen-narrow.svg"]) {
    const ok = await request.get(`/design-system/sample-image/${name}`);
    expect(ok.status(), name).toBe(200);
    expect(ok.headers()["content-type"], name).toContain("image/svg+xml");
  }
  const dashboard = await request.get("/design-system/sample-image/dashboard.svg");
  expect((await dashboard.text()).length).toBeGreaterThan(2000);
  for (const name of ["nope.svg", "toString", "constructor", "__proto__"]) {
    const missing = await request.get(`/design-system/sample-image/${name}`);
    expect(missing.status(), name).toBe(404);
  }
});
