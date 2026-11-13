import { servicesContent } from "../src/content/site/services";
import { expect, test } from "./fixtures";

const section = "#services";

test("the services section sits after Selected work and before Contact, with every service", async ({
  page,
}) => {
  await page.goto("/?hero=fallback");
  await expect(
    page.getByRole("heading", { level: 2, name: servicesContent.heading }),
  ).toBeVisible();
  const rows = page.locator(`${section} [data-service]`);
  await expect(rows).toHaveCount(servicesContent.services.length);
  for (const [index, service] of servicesContent.services.entries()) {
    const row = rows.nth(index);
    await expect(row.getByRole("heading", { level: 3 })).toHaveText(service.name);
    await expect(row).toContainText(service.audience);
    await expect(row).toContainText(service.includes);
    await expect(row.getByRole("link", { name: `${service.name}: details` })).toHaveAttribute(
      "href",
      `/services/${service.id}`,
    );
    // "Seen in" links go to case studies on this site, never off it.
    for (const work of service.seen) {
      const link = row.getByRole("link", { name: work.label });
      await expect(link).toHaveAttribute("href", /^\/(?:websites-ecommerce|saas-dashboards)\//);
    }
  }
  await expect(page.locator(`${section} a[href^="http"]`)).toHaveCount(0);
});

test("the left column offers contact and the services page", async ({ page }) => {
  await page.goto("/?hero=fallback");
  const area = page.locator(section);
  await expect(area.getByRole("link", { name: "All services in detail" })).toHaveAttribute(
    "href",
    "/services",
  );
  await expect(area.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
    "href",
    "/#contact",
  );
});

test("the plate and tiles are decoration: not in the tab order or the reading order", async ({
  page,
}) => {
  await page.goto("/?hero=fallback");
  const plate = page.locator(`${section} [data-services-plate]`);
  await expect(plate).toHaveAttribute("aria-hidden", "true");
  expect(
    await plate.locator("a").evaluateAll((links) => links.map((link) => link.tabIndex)),
  ).toEqual(Array(4).fill(-1));
  // Generated artwork only: no project capture in this section.
  await expect(page.locator(`${section} img`)).toHaveCount(0);
  const tiles = page.locator(`${section} [data-service-tile]`);
  await expect(tiles).toHaveCount(4);
  for (const tile of await tiles.all()) {
    await expect(tile).toHaveAttribute("aria-hidden", "true");
    await expect(tile.locator("svg").first()).toBeAttached();
  }
});

test.describe("wide screens", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the heading column stays pinned while the list scrolls past", async ({ page }) => {
    await page.goto("/?hero=fallback");
    const header = page.locator(`${section} header`);
    await page.locator(`${section} [data-services-list]`).scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const list = document.querySelector("#services [data-services-list]")!;
      scrollTo({ top: list.getBoundingClientRect().top + scrollY - 200, behavior: "instant" });
    });
    const before = (await header.boundingBox())!.y;
    await page.evaluate(() => scrollBy({ top: 300, behavior: "instant" }));
    const after = (await header.boundingBox())!.y;
    expect(Math.abs(after - before)).toBeLessThan(2);
  });

  test("a tile gets crop marks and lifts, a plate piece frames itself, links get a lime marker", async ({
    page,
  }) => {
    await page.goto("/?hero=fallback");
    const tile = page.locator('[data-service-tile="dashboards"]');
    await tile.scrollIntoViewIfNeeded();
    await tile.hover();
    const marks = tile.locator("[data-print-marks]");
    await expect.poll(() => marks.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect
      .poll(() =>
        tile.locator("[data-print-lift]").evaluate((el) => getComputedStyle(el).translate),
      )
      .toBe("-4px -4px");
    const piece = page.locator(`${section} [data-services-plate] a[data-plate-piece]`).first();
    await piece.scrollIntoViewIfNeeded();
    await piece.hover();
    const frame = piece.locator("span").nth(1);
    await expect.poll(() => frame.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    const link = page
      .locator(`${section} [data-service="dashboards"]`)
      .getByRole("link", { name: "ToolSwift admin platform" });
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await expect
      .poll(() => link.evaluate((el) => getComputedStyle(el).backgroundSize))
      .toBe("100% 100%");
  });
});

test.describe("entrance motion", () => {
  test.use({ entranceMotion: true });

  test("the plate, tiles, rule and rows reveal as they scroll into view", async ({ page }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const plate = page.locator(`${section} [data-services-plate]`);
    const list = page.locator(`${section} [data-services-list]`);
    await expect(plate).not.toHaveAttribute("data-revealed", "");
    await plate.scrollIntoViewIfNeeded();
    await expect(plate).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    // Each part reveals on its own: the last row waits until it is scrolled near.
    const rows = await page.locator(`${section} [data-service]`).all();
    await expect(rows[rows.length - 1]).not.toHaveAttribute("data-revealed", "");
    await list.scrollIntoViewIfNeeded();
    await expect(list).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    // Everything ends fully shown: no leftover clip, fade, slide or grayscale.
    for (const row of rows) {
      await row.scrollIntoViewIfNeeded();
      await expect(row).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
      await expect
        .poll(
          () =>
            row.evaluate((el) => [getComputedStyle(el).opacity, getComputedStyle(el).translate]),
          {
            timeout: 10_000,
          },
        )
        .toEqual(["1", "none"]);
    }
    await plate.scrollIntoViewIfNeeded();
    const open = /^(?:none|inset\(0px(?: 0px 0px 0px)?\))$/;
    await expect
      .poll(() =>
        plate.evaluate((el) => {
          const picture = el.querySelector("svg")!;
          return [getComputedStyle(el).clipPath, getComputedStyle(picture).filter];
        }),
      )
      .toEqual([expect.stringMatching(open), "none"]);
    await expect
      .poll(() => list.evaluate((el) => getComputedStyle(el, "::before").transform), {
        timeout: 10_000,
      })
      .toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("everything is simply there", async ({ page }) => {
      await page.goto("/?hero=fallback");
      await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
      for (const row of await page.locator(`${section} [data-service]`).all())
        expect(await row.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      expect(
        await page
          .locator(`${section} [data-services-plate]`)
          .evaluate((el) => getComputedStyle(el).clipPath),
      ).toBe("none");
    });
  });

  test.describe("without scripting", () => {
    test.use({ javaScriptEnabled: false });
    test("everything is simply there", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(`${section} [data-service]`)).toHaveCount(4);
      expect(
        await page
          .locator(`${section} [data-services-list]`)
          .evaluate((el) => getComputedStyle(el, "::before").transform),
      ).toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    });
  });
});
