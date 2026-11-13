import { expect, test } from "../fixtures";

test("the supplied About layout shows every section", async ({ page }) => {
  await page.goto("/design-system/about");
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("About");
  await expect(main.getByRole("heading", { level: 3 })).toHaveText([
    "Areas of work",
    "Approach",
    "Background",
  ]);
  await expect(main.getByRole("link", { name: "Websites & E-commerce" })).toHaveAttribute(
    "href",
    "/work",
  );
  await expect(main.getByRole("link", { name: "SaaS & Dashboards" })).toHaveAttribute(
    "href",
    "/work",
  );
  await expect(main.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
    "href",
    "/#contact",
  );
});

test("the not-supplied About state is honest and offers a way forward", async ({ page }) => {
  await page.goto("/design-system/about/empty");
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("About");
  await expect(main.getByText("This page is being prepared.")).toBeVisible();
  await expect(main.getByRole("heading", { level: 3 })).toHaveCount(0);
  await expect(main.getByRole("link")).toHaveText(["Work", "Contact"]);
});

test("review pages are not offered to search engines", async ({ page }) => {
  await page.goto("/design-system/about");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

for (const path of ["/design-system/about", "/design-system/about/empty"]) {
  test(`${path} has no horizontal overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
