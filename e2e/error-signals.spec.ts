import { expect, test } from "./fixtures";
import { recordSignals } from "./signals";

type Signal = { url: string; body: { kind: string; path: string; detail: string } };

test("a contact form that cannot reach the site tells the owner's dashboard", async ({ page }) => {
  const signals = await recordSignals(page);
  await page.route("**/api/contact", (route) => route.abort("internetdisconnected"));
  await page.goto("/?hero=fallback");
  const form = page.locator("#contact form");
  await form.scrollIntoViewIfNeeded();
  await form.getByText("Something else").click();
  await form.getByLabel("Email").fill("kim@studio.co");
  await form.getByLabel("Your message").fill("Hello there");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("[data-contact-failure]")).toContainText("connection failed");
  await expect
    .poll(async () => ((await signals()) as Signal[]).filter((s) => s.body.kind === "form_error"))
    .toEqual([
      {
        url: "/api/track",
        body: {
          kind: "form_error",
          path: "/",
          referrer: "",
          detail: "The connection failed before the message reached the site",
        },
      },
    ]);
  // Never the form's contents.
  expect(JSON.stringify(await signals())).not.toContain("kim@studio.co");
});

test("a page error is reported once, with no personal data", async ({ page }) => {
  const signals = await recordSignals(page);
  await page.goto("/about");
  // The page view is sent once the tracker is listening; only then can it catch errors.
  await expect
    .poll(async () => ((await signals()) as Signal[]).some((s) => s.body.kind === "page_view"))
    .toBe(true);
  // A real page script (not Playwright's own evaluation code, which counts as an extension).
  await page.addScriptTag({
    content: `for (let i = 0; i < 3; i++) setTimeout(() => { throw new Error("Boom for sam@studio.co"); });`,
  });
  await expect
    .poll(async () => ((await signals()) as Signal[]).filter((s) => s.body.kind === "client_error"))
    .toHaveLength(1);
  const [error] = ((await signals()) as Signal[]).filter((s) => s.body.kind === "client_error");
  expect(error.body.path).toBe("/about");
  expect(error.body.detail).toContain("Boom for");
  expect(error.body.detail).not.toContain("sam@studio.co");
});
