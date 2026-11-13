import { servicePageLabels, servicesContent } from "../src/content/site/services";
import { expect, test } from "./fixtures";

const services = servicesContent.services;

for (const service of services) {
  test(`${service.id}: its own page, with its copy, work and questions`, async ({ page }) => {
    test.slow();
    const response = await page.goto(`/services/${service.id}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(service.page.title);
    await expect(page).toHaveTitle(new RegExp(service.page.title.slice(0, 20)));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      service.page.description,
    );
    await expect(page.getByText(service.page.answer, { exact: true })).toBeVisible();
    // Get in touch stands alone: no email address is offered beside it.
    await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
    for (const point of service.page.points)
      await expect(page.getByText(point, { exact: true })).toBeVisible();
    for (const item of service.page.faq) {
      await expect(page.getByText(item.question, { exact: true })).toBeVisible();
      await expect(page.getByText(item.answer, { exact: true })).toBeVisible();
    }
    for (const work of service.seen)
      await expect(page.getByRole("link", { name: work.label })).toHaveAttribute(
        "href",
        /^\/(?:websites-ecommerce|saas-dashboards)\//,
      );
    // The crumb and the other services lead back into the section, never off the site.
    await expect(
      page.getByRole("main").getByRole("link", { name: servicePageLabels.crumb, exact: true }),
    ).toHaveAttribute("href", "/services");
    const other = page.getByRole("navigation", { name: servicePageLabels.otherTitle });
    await expect(other.getByRole("link")).toHaveCount(services.length); // the three others and "All services";
    await expect(other.locator(`a[href="/services/${service.id}"]`)).toHaveCount(0);
    await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  });
}

test("an unknown service is a 404", async ({ request }) => {
  const response = await request.get("/services/not-a-service");
  expect(response.status()).toBe(404);
});

test("the page has an address of its own for sharing", async ({ page, request }) => {
  await page.goto(`/services/${services[0].id}`);
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toBeTruthy();
  const path = new URL(image as string, "http://localhost").pathname;
  const picture = await request.get(path);
  expect(picture.status()).toBe(200);
  expect(picture.headers()["content-type"]).toContain("image/png");
});

test("nothing scrolls sideways and the pictures stack on a phone", async ({ page }) => {
  test.slow();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`/services/${services[1].id}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `${width}px`,
    ).toBe(true);
    const included = page
      .getByRole("heading", { level: 2, name: servicePageLabels.included })
      .locator("xpath=ancestor::section[1]");
    const [stage, title] = await Promise.all([
      included.locator("[data-service-stage]").boundingBox(),
      included.getByRole("heading", { level: 2 }).boundingBox(),
    ]);
    if (width < 1024) expect(stage!.y).toBeLessThan(title!.y);
    else expect(stage!.x).toBeGreaterThan(title!.x);
  }
});

test("the services page leads to every service page", async ({ page }) => {
  test.slow();
  await page.goto("/services");
  for (const service of services)
    await expect(page.getByRole("link", { name: `${service.name}: full details` })).toHaveAttribute(
      "href",
      `/services/${service.id}`,
    );
  const response = await page.request.get(`/services/${services[3].id}`);
  expect(response.status()).toBe(200);
});

test.describe("entrance motion", () => {
  test.use({ entranceMotion: true });

  test("the cover is printed in and the list draws as it comes into view", async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/services/${services[0].id}`);
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const cover = page.locator("[data-service-stage]").first();
    await expect(cover).toHaveAttribute("data-revealed", "", { timeout: 15_000 });
    const list = page.locator('ul[data-reveal="ledger"]').first();
    await list.evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.6);
    });
    await expect(list).toHaveAttribute("data-revealed", "", { timeout: 15_000 });
    await expect
      .poll(
        () =>
          list
            .locator("> li")
            .last()
            .evaluate((node) => getComputedStyle(node).opacity),
        {
          timeout: 8000,
        },
      )
      .toBe("1");
  });
});
