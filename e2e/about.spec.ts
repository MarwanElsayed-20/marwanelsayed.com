import { navItems } from "../src/config/navigation";
import { expect, test } from "./fixtures";
import { primaryNav, openMenu } from "./helpers/menu";
import { aboutContent, aboutPage } from "../src/content/site/about";
import { siteName } from "../src/content/site/identity";
import { contactDetails } from "../src/content/site/contact";

test("/about has one h1 with the owner's name, the portrait and every supplied band", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveText(siteName!);
  await expect(page.locator("main")).toContainText(aboutContent.introduction[0]);
  await expect(page.locator("main")).toContainText(aboutContent.introduction[1]);
  await expect(page.getByRole("img", { name: aboutPage.portrait.alt })).toBeVisible();
  await expect(page.locator("main h2")).toHaveText([
    aboutPage.current.title,
    aboutPage.areas.title,
    aboutPage.approach.title,
    aboutPage.experience.title,
    aboutPage.profiles.title,
  ]);
  for (const entry of aboutContent.experience ?? [])
    await expect(page.locator("main")).toContainText(entry.place ?? entry.role);
});

test("the current work, the email and the profiles lead where they say", async ({ page }) => {
  await page.goto("/about");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: /Customer Dashboard/i }).first()).toHaveAttribute(
    "href",
    /\/saas-dashboards\/toolswift-customer-dashboard$/,
  );
  const profiles = main.getByRole("navigation", { name: aboutPage.profiles.label });
  if (contactDetails.email)
    await expect(profiles.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      `mailto:${contactDetails.email}`,
    );
  for (const profile of contactDetails.profiles)
    await expect(
      profiles.getByRole("link", { name: new RegExp(`^${profile.label}`) }),
    ).toHaveAttribute("href", profile.url);
});

test("Get in touch lands on the top edge of the invitation on the home page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await page.getByRole("main").getByRole("link", { name: aboutPage.actions.touch }).click();
  await expect(page).toHaveURL(/\/#contact$/, { timeout: 15_000 });
  const contact = page.locator("#contact");
  await expect(contact).toBeFocused({ timeout: 15_000 });
  // The page transition plays on after the route changes; the landing must hold when it ends.
  await expect(page.locator("html")).not.toHaveAttribute("data-page-transition", "true", {
    timeout: 15_000,
  });
  await expect
    .poll(() => contact.evaluate((el) => Math.abs(el.getBoundingClientRect().top - 24)))
    .toBeLessThan(1);
});

test.describe("motion", () => {
  test.use({ entranceMotion: true });

  test("the portrait is printed in: its frame wipes in, then the picture, to colour", async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const portrait = page.locator("[data-about-portrait]");
    await expect(portrait).toHaveAttribute("data-revealed", "", { timeout: 15_000 });
    const picture = portrait.locator("[data-print-picture]");
    await expect
      .poll(() => picture.evaluate((node) => getComputedStyle(node).filter), { timeout: 8000 })
      .toBe("none");
    expect(await portrait.evaluate((node) => getComputedStyle(node).clipPath)).not.toContain(
      "100%",
    );
  });

  test("a band's rule draws in and its label and text slide in after it", async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const band = page
      .locator("#profiles-title")
      .locator("xpath=ancestor::div[@data-reveal='ledger'][1]");
    await expect(band).not.toHaveAttribute("data-revealed", "");
    await band.evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.3);
    });
    await expect(band).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    const delays = await band.evaluate((node) =>
      [...node.children].map((child) => getComputedStyle(child).transitionDelay),
    );
    expect(delays).toEqual(["0.22s", "0.29s"]);
  });
});

test.describe("reduced motion", () => {
  test.use({ entranceMotion: true });

  test("everything is simply there, the portrait in colour", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    await expect(page.getByRole("img", { name: aboutPage.portrait.alt })).toBeVisible();
    expect(
      await page.locator("[data-print-picture]").evaluate((node) => getComputedStyle(node).filter),
    ).toBe("none");
    await expect(page.locator("main h2").first()).toBeVisible();
  });
});

test("areas of work link into the filtered Work index", async ({ page }) => {
  await page.goto("/about");
  await page
    .getByRole("main")
    .getByRole("link", { name: /SaaS & Dashboards/ })
    .click();
  await expect(page).toHaveURL(/\/work(#work)?$/);
  await expect(
    page
      .getByRole("group", { name: "Filter work" })
      .getByRole("button", { name: /^SaaS & Dashboards/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the menu marks About as the current page", async ({ page }) => {
  await page.goto("/about");
  await openMenu(page);
  await expect(primaryNav(page).locator('a[href="/about"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test.describe("footer", () => {
  test("is dark, shows the email, sitemap and profiles, and returns to the top", async ({
    page,
  }) => {
    await page.goto("/about");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    if (contactDetails.email)
      await expect(footer.getByRole("link", { name: contactDetails.email })).toHaveAttribute(
        "href",
        `mailto:${contactDetails.email}`,
      );
    await expect(footer.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveCount(
      navItems.length,
    );
    // The back-to-top button ends above the last letter of the name.
    const ends = await footer.evaluate((node) => {
      const button = node.querySelector("[data-back-to-top]")!.getBoundingClientRect();
      const name = node.querySelector("[data-footer-name] p")!;
      const range = document.createRange();
      range.selectNodeContents(name);
      return { button: button.right, name: range.getBoundingClientRect().right };
    });
    expect(Math.abs(ends.button - ends.name)).toBeLessThan(24);
    // The name itself runs the full width of the footer's content.
    const span = await footer.evaluate((node) => {
      const name = node.querySelector("[data-footer-name] p")!;
      const range = document.createRange();
      range.selectNodeContents(name);
      const box = range.getBoundingClientRect();
      const frame = name.closest("[data-footer-name]")!.getBoundingClientRect();
      return { left: box.left - frame.left, right: frame.right - box.right };
    });
    expect(Math.abs(span.left)).toBeLessThan(8);
    expect(Math.abs(span.right)).toBeLessThan(8);
    await footer.getByRole("button", { name: /Back to top/ }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  for (const width of [320, 360, 768, 1440])
    test(`never overflows horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ["/", "/about"]) {
        await page.goto(path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    });
});
