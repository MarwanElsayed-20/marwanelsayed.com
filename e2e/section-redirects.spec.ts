import { openMenu, primaryNav } from "./helpers/menu";
import { expect, test } from "./fixtures";
import { digitalExperiencesProjects } from "../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../src/content/projects/digital-products";

const sections = [
  {
    old: "/digital-experiences",
    next: "/websites-ecommerce",
    slug: digitalExperiencesProjects[0].slug,
  },
  { old: "/digital-products", next: "/saas-dashboards", slug: digitalProductsProjects[0].slug },
];

test("tablet menu shows the four destinations", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 800 });
  await page.goto("/");
  await openMenu(page);
  const nav = primaryNav(page);
  await expect(nav.locator("ul").first().getByRole("link")).toHaveText([
    /Home$/,
    /Work$/,
    /Services$/,
    /About$/,
  ]);
});

for (const section of sections) {
  for (const suffix of ["", `/${section.slug}`]) {
    for (const trailing of ["", "/"]) {
      test(`${section.old}${suffix}${trailing} redirects permanently in one hop with its query`, async ({
        request,
      }) => {
        const query = "?ref=shared&label=hello%20world";
        const response = await request.get(`${section.old}${suffix}${trailing}${query}`, {
          maxRedirects: 0,
        });
        expect(response.status()).toBe(308);
        const location = response.headers().location;
        expect(location).toBe(suffix ? `${section.next}${suffix}${query}` : `/work${query}`);
        const destination = await request.get(location, { maxRedirects: 0 });
        expect(destination.status()).toBe(200);
        expect(destination.headers().location).toBeUndefined();
      });
    }
  }

  test(`${section.old} unknown slug ends on the normal not-found page`, async ({ page }) => {
    const response = await page.goto(`${section.old}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveURL(`${section.next}/does-not-exist`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

for (const section of sections) {
  test(`${section.next} labels fit at 360px with reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(section.next);
    await openMenu(page);
    const nav = primaryNav(page);
    await expect(nav.getByRole("link", { name: "Work", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About", exact: true })).toBeVisible();
    // The page is pushed aside as a card, so only the menu itself is measured.
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
  });
}

for (const anchor of ["websites-ecommerce", "saas-dashboards"])
  test(`${anchor} root redirects without matching detail pages`, async ({ request }) => {
    const response = await request.get(`/${anchor}?ref=shared`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/work?ref=shared");
    expect((await request.get(response.headers().location, { maxRedirects: 0 })).status()).toBe(
      200,
    );
  });
