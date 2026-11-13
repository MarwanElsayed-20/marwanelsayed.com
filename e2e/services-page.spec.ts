import { servicesContent, servicesPage } from "../src/content/site/services";
import { expect, test } from "./fixtures";

const services = servicesContent.services;

test("the page names itself, offers contact and lists every service", async ({ page }) => {
  test.slow();
  await page.goto("/services");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(servicesPage.title);
  await expect(page).toHaveTitle(/Services/);
  await expect(page.getByRole("link", { name: servicesPage.askLabel }).first()).toHaveAttribute(
    "href",
    "/#contact",
  );
  for (const service of services) {
    const section = page.locator(`section#${service.id}`);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(service.name);
    await expect(section).toContainText(service.audience);
    for (const point of service.page.points) await expect(section).toContainText(point);
    await expect(
      section.getByRole("link", { name: `${service.name}: full details` }),
    ).toHaveAttribute("href", `/services/${service.id}`);
    for (const work of service.seen)
      await expect(section.getByRole("link", { name: work.label })).toHaveAttribute(
        "href",
        /^\/(?:websites-ecommerce|saas-dashboards)\//,
      );
  }
  // Generated artwork only, and nothing leaves the site: Get in touch stands alone, no email.
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
});

test("the numbered list jumps to a service and puts focus on it", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/services");
  const jump = page.getByRole("navigation", { name: servicesPage.jumpLabel });
  await expect(jump.getByRole("link")).toHaveCount(services.length);
  await jump.getByRole("link", { name: services[2].name }).click();
  await expect(page).toHaveURL(new RegExp(`#${services[2].id}$`));
  await expect(page.locator(`section#${services[2].id}`)).toBeFocused();
  const top = await page.locator(`section#${services[2].id}`).evaluate((node) => {
    return node.getBoundingClientRect().top;
  });
  expect(Math.abs(top)).toBeLessThan(120);
});

test("on a wide screen the picture stays beside the text and the sides alternate", async ({
  page,
}) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/services");
  const stages = page.locator("[data-service-stage]");
  await expect(stages).toHaveCount(services.length);
  const left: boolean[] = [];
  for (const [index, service] of services.entries()) {
    const stage = stages.nth(index);
    const text = page.locator(`section#${service.id} h2`);
    expect(await stage.locator("..").evaluate((node) => getComputedStyle(node).position)).toBe(
      "sticky",
    );
    const [a, b] = await Promise.all([stage.boundingBox(), text.boundingBox()]);
    left.push(a!.x < b!.x);
  }
  expect(left).toEqual([false, true, false, true]);
});

test("on a phone the picture comes first and nothing scrolls sideways", async ({ page }) => {
  test.slow();
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/services");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `${width}px`,
    ).toBe(true);
    const section = page.locator(`section#${services[0].id}`);
    const [stage, title] = await Promise.all([
      section.locator("[data-service-stage]").boundingBox(),
      section.getByRole("heading", { level: 2 }).boundingBox(),
    ]);
    if (width < 1024) expect(stage!.y).toBeLessThan(title!.y);
  }
});

test.describe("entrance motion", () => {
  test.use({ entranceMotion: true });

  test("a list's rule draws and its items slide in one after another", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/services");
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const list = page.locator(`section#${services[1].id} ul[data-reveal="ledger"]`);
    await expect(list).not.toHaveAttribute("data-revealed", "");
    expect(
      await list
        .locator("> li")
        .first()
        .evaluate((node) => getComputedStyle(node).opacity),
    ).toBe("0");
    await list.evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.6);
    });
    await expect(list).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    const delays = await list
      .locator("> li")
      .evaluateAll((nodes) =>
        nodes.map((node) => parseFloat(getComputedStyle(node).transitionDelay)),
      );
    // 0.22s for the first, then 0.07s more for each.
    expect(delays.slice(0, 5).map((value) => Math.round(value * 100) / 100)).toEqual([
      0.22, 0.29, 0.36, 0.43, 0.5,
    ]);
    await expect
      .poll(
        () =>
          list
            .locator("> li")
            .last()
            .evaluate((node) => getComputedStyle(node).opacity),
        { timeout: 8000 },
      )
      .toBe("1");
  });

  test("a picture is printed in: its frame wipes in before its drawing", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/services");
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const stage = page.locator("[data-service-stage]").nth(1);
    await expect(stage).not.toHaveAttribute("data-revealed", "");
    expect(await stage.evaluate((node) => getComputedStyle(node).clipPath)).toContain("100%");
    await stage.evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.3);
    });
    await expect(stage).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    await expect
      .poll(() => stage.evaluate((node) => getComputedStyle(node).clipPath), { timeout: 5000 })
      .not.toContain("100%");
  });
});

test.describe("reduced motion", () => {
  test.use({ entranceMotion: true });

  test("everything is simply there", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const service of services)
      expect(
        await page
          .locator(`section#${service.id} ul li`)
          .first()
          .evaluate((node) => getComputedStyle(node).opacity),
      ).toBe("1");
  });
});
