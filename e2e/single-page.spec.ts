import { expect, test } from "./fixtures";
import { servicesContent } from "../src/content/site/services";
import { contactDetails } from "../src/content/site/contact";

const sections = ["selected-work", "services", "contact"];
test("home has one h1, ordered sections and four selected scenes", async ({ page }) => {
  await page.goto("/?hero=fallback");
  await expect(page.locator("main h1")).toHaveCount(1);
  expect(
    await page
      .locator("main > :is(section, div)[id]")
      .evaluateAll((nodes) => nodes.map((n) => n.id)),
  ).toEqual(sections);
  await expect(page.locator("#selected-work [data-scene]")).toHaveCount(4);
  await expect(page.locator("[data-work-entry]")).toHaveCount(0);
  await expect(page.locator("#services")).toContainText(servicesContent.heading);
  if (contactDetails.email)
    await expect(page.locator("#contact")).toContainText(contactDetails.email);
  await expect(page.locator("main form")).toHaveCount(1);
  await expect(page.locator("#contact form")).toBeAttached();
  await expect(page.locator('#selected-work a[href^="http"]')).toHaveCount(0);
});

for (const width of [360, 768, 1440])
  test(`home reflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?hero=fallback");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
