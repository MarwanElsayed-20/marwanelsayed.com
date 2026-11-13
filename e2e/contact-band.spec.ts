import { contactCta, contactDetails } from "../src/content/site/contact";
import { expect, test } from "./fixtures";

const cta = (page: import("./fixtures").Page) =>
  page.locator("section[aria-labelledby=contact-cta-heading]");

const lime = (page: import("./fixtures").Page) => page.locator('#contact [data-surface="lime"]');

test("#contact starts at the invitation and holds the form band after it, in lime", async ({
  page,
}) => {
  await page.goto("/?hero=fallback");
  await expect(page.locator("#contact-cta-heading")).toHaveText(contactCta.heading);
  await expect(cta(page).getByText(contactCta.line)).toBeAttached();
  const order = await page.evaluate(() => {
    const a = document.getElementById("contact-cta-heading")!.closest("section")!;
    const b = document.querySelector('#contact [data-surface="lime"]');
    const start = document.getElementById("contact")!;
    return a.nextElementSibling === b && start.firstElementChild === a;
  });
  expect(order).toBe(true);
  const band = lime(page);
  await expect(band).toHaveAttribute("data-surface", "lime");
  await expect(band.locator("form")).toBeAttached();
  await expect(band.getByRole("link", { name: contactDetails.email! })).toBeVisible();
  for (const profile of contactDetails.profiles)
    await expect(band.getByRole("link", { name: profile.label })).toBeVisible();
});

test("the logos are decoration: hidden from assistive technology and out of the tab order", async ({
  page,
}) => {
  await page.goto("/?hero=fallback");
  const layer = cta(page).locator("[data-contact-logos]");
  await expect(layer).toHaveAttribute("aria-hidden", "true");
  expect(await layer.locator("a, button, input").count()).toBe(0);
});

test.describe("entrance motion", () => {
  test.use({ entranceMotion: true });

  test("logos are launched while the invitation is on screen and clear away behind it", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const layer = cta(page).locator("[data-contact-logos]");
    await expect(layer).not.toHaveAttribute("data-live", "");
    await cta(page).scrollIntoViewIfNeeded();
    await expect(layer).toHaveAttribute("data-live", "");
    const flying = layer.locator("[data-contact-logo]:not([data-contact-still])");
    await expect.poll(() => flying.count(), { timeout: 15_000 }).toBeGreaterThan(0);
    // The still logos are for no-motion only.
    await expect(layer.locator("[data-contact-still]").first()).toBeHidden();
    // Leaving the band stops the show: nothing new appears while it is off screen.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
    const before = await flying.count();
    await page.waitForTimeout(4_000);
    expect(await flying.count()).toBeLessThanOrEqual(before);
  });

  test("the form card reveals as the band comes into view", async ({ page }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const card = page.locator("#contact [data-contact-card]");
    await expect(card).not.toHaveAttribute("data-revealed", "");
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("the logos stay still, and everything is simply there", async ({ page }) => {
      await page.goto("/?hero=fallback");
      const layer = cta(page).locator("[data-contact-logos]");
      await expect(layer).not.toHaveAttribute("data-live", "");
      await expect(layer.locator("[data-contact-still]").first()).toBeVisible();
      await expect(page.locator("#contact [data-contact-card]")).toBeVisible();
    });
  });
});

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled: false });
  test("the still logos and the invitation are there", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact-cta-heading")).toBeVisible();
    await expect(cta(page).locator("[data-contact-still]").first()).toBeVisible();
  });
});

test("the bands do not overflow sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/?hero=fallback");
  const wide = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(wide).toBe(false);
});

test("the bands hug their content: no screen-tall empty space between them or above the footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?hero=fallback");
  const gaps = await page.evaluate(() => {
    const top = (e: Element) => e.getBoundingClientRect().top + scrollY;
    const bottom = (e: Element) => e.getBoundingClientRect().bottom + scrollY;
    const band = document.querySelector('#contact [data-surface="lime"]')!;
    const card = band.querySelector("[data-contact-card]")!;
    const left = band.querySelector("ul")!;
    const heading = band.querySelector("h2")!;
    const footer = document.querySelector("footer")!;
    const cta = document.getElementById("contact-cta-heading")!.closest("section")!;
    const line = cta.querySelector("p[data-reveal]")!;
    return {
      ctaHeight: cta.getBoundingClientRect().height,
      belowText: top(band) - bottom(line),
      aboveContent: Math.min(top(heading), top(card)) - top(band),
      belowContent: bottom(footer.previousElementSibling!) - Math.max(bottom(card), bottom(left)),
    };
  });
  expect(gaps.ctaHeight).toBeLessThan(900 * 0.8);
  expect(gaps.belowText).toBeLessThan(260);
  expect(Math.abs(gaps.aboveContent - gaps.belowContent)).toBeLessThan(60);
});

test("a link to #contact lands on the top edge of the invitation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?hero=fallback#contact");
  const contact = page.locator("#contact");
  await expect(contact).toBeFocused();
  await expect
    .poll(() => contact.evaluate((el) => Math.abs(el.getBoundingClientRect().top - 24)))
    .toBeLessThan(1);
  const edges = await page.evaluate(() => {
    const start = document.getElementById("contact")!.getBoundingClientRect().top;
    const cta = document.getElementById("contact-cta-heading")!.closest("section")!;
    return { start, cta: cta.getBoundingClientRect().top };
  });
  expect(edges.cta).toBeCloseTo(edges.start, 0);
});

test("from another page, Get in touch settles on the top edge of the invitation and stays", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/services");
  await page.getByRole("main").getByRole("link", { name: "Get in touch" }).first().click();
  await expect(page).toHaveURL(/\/#contact$/, { timeout: 15_000 });
  const contact = page.locator("#contact");
  await expect(contact).toBeFocused({ timeout: 15_000 });
  // The new page grows into place after the route changes; the landing must not depend on it.
  await expect(page.locator("html")).not.toHaveAttribute("data-page-transition", "true", {
    timeout: 15_000,
  });
  for (let sample = 0; sample < 4; sample += 1) {
    expect(
      await contact.evaluate((el) => Math.abs(el.getBoundingClientRect().top - 24)),
    ).toBeLessThan(1);
    await page.waitForTimeout(300);
  }
});
