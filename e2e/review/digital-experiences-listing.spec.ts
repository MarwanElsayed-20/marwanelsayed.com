import { expect, test } from "../fixtures";

const LIST = "/design-system/digital-experiences";

test("the sample listing loads, is not indexable, and has one h1", async ({ page }) => {
  const response = await page.goto(LIST);
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText("Placeholder content.")).toBeVisible();
});

test("projects are grouped under the three categories in the fixed order", async ({ page }) => {
  await page.goto(LIST);
  const groups = await page.getByRole("heading", { level: 2 }).allTextContents();
  expect(groups).toEqual(["E-commerce", "Landing pages", "Interactive websites"]);
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
    page.getByRole("link", { name: "Sample project: full page, E-commerce" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sample project: minimal page, Landing pages" }),
  ).toBeVisible();
});

test("cards never show technologies, period, or status", async ({ page }) => {
  await page.goto(LIST);
  const articles = page.locator("article");
  await expect(articles.getByText("Sample tool one")).toHaveCount(0);
  await expect(articles.getByText("Sample period")).toHaveCount(0);
  await expect(
    articles.getByText("This project is no longer online.", { exact: true }),
  ).toHaveCount(0);
  await expect(
    articles.getByText("Sample summary for a project recorded as no longer online.", {
      exact: true,
    }),
  ).toHaveCount(1);
});

test("a card without an image shows the lettered frame and no img", async ({ page }) => {
  await page.goto(LIST);
  const card = page.locator("article", { hasText: "Sample project: no image" });
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator('[aria-hidden="true"]').first()).toHaveText("S");
});

test("the empty page shows the empty state and no cards", async ({ page }) => {
  const response = await page.goto(`${LIST}/empty`);
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 2, name: "Selected work is being added" }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("the sample image route serves SVGs here and 404s for unknown names", async ({ request }) => {
  const ok = await request.get("/design-system/sample-image/one.svg");
  expect(ok.status()).toBe(200);
  expect(ok.headers()["content-type"]).toContain("image/svg+xml");
  for (const name of ["nope.svg", "toString", "constructor", "__proto__"]) {
    const missing = await request.get(`/design-system/sample-image/${name}`);
    expect(missing.status(), name).toBe(404);
  }
});
