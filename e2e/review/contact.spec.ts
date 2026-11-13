import { expect, test } from "../fixtures";

const EMAIL = "sample@sample-contact.invalid";

test("the supplied Contact layout shows the address as text and as a link", async ({ page }) => {
  await page.goto("/design-system/contact");
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Contact");
  await expect(main.getByRole("heading", { level: 3 })).toHaveText(["Email", "Elsewhere"]);
  const link = main.getByRole("link", { name: EMAIL });
  await expect(link).toHaveText(EMAIL);
  await expect(link).toHaveAttribute("href", `mailto:${EMAIL}`);
});

test("profile links are safe external links", async ({ page }) => {
  await page.goto("/design-system/contact");
  const external = page.getByRole("main").locator('a[target="_blank"]');
  await expect(external).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(external.nth(index)).toHaveAttribute("rel", /noopener/);
    await expect(external.nth(index)).toHaveAttribute("rel", /noreferrer/);
  }
});

test("the page has no form and loads no script from another origin", async ({ page }) => {
  await page.goto("/design-system/contact");
  await expect(page.locator("main form, main input, main textarea")).toHaveCount(0);
  const origins = await page.evaluate(() =>
    [...document.querySelectorAll("script[src]")].map(
      (script) => new URL(script.getAttribute("src") ?? "", location.href).origin,
    ),
  );
  for (const origin of origins) {
    expect(origin).toBe(new URL(page.url()).origin);
  }
});

test("the not-supplied Contact state is honest and offers a way forward", async ({ page }) => {
  await page.goto("/design-system/contact/empty");
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Contact");
  await expect(main.getByText("Contact details are being prepared.")).toBeVisible();
  await expect(main.getByRole("heading", { level: 3 })).toHaveCount(0);
  await expect(main.getByRole("link")).toHaveText(["Work", "About"]);
});

for (const path of ["/design-system/contact", "/design-system/contact/empty"]) {
  test(`${path} has no horizontal overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
