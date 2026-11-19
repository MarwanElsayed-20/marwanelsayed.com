import { expect, test } from "./fixtures";
import { recordSignals } from "./signals";
import { cvDownload } from "../src/content/site/cv";

test("the hero has About me and a CV download under the introduction", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?hero=fallback");
  const actions = page.locator("[data-hero-actions]");
  await expect(actions.getByRole("link", { name: "About me" })).toHaveAttribute("href", "/about");
  const cv = actions.getByRole("link", { name: /^CV/ });
  await expect(cv).toHaveAttribute("href", cvDownload.href);
  await expect(cv).toHaveAttribute("download", cvDownload.fileName);
  // Under the introduction, in the first screen.
  const intro = await page.locator("#hero-heading ~ p").first().boundingBox();
  const box = await actions.boundingBox();
  expect(box!.y).toBeGreaterThan(intro!.y + intro!.height - 1);
  expect(box!.y + box!.height).toBeLessThan(900);
});

test("the CV link downloads a PDF with the file's own name", async ({ page, request }) => {
  await page.goto("/?hero=fallback");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .locator("[data-hero-actions]")
      .getByRole("link", { name: /^CV/ })
      .evaluate((link) => (link as HTMLElement).click()),
  ]);
  expect(download.suggestedFilename()).toBe(cvDownload.fileName);
  const response = await request.get(cvDownload.href);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

for (const width of [320, 390, 768, 1280, 1920])
  test(`the hero actions fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?hero=fallback");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator("[data-hero-actions]")).toBeVisible();
  });

test("the About page offers the CV beside See the work and Get in touch", async ({ page }) => {
  await page.goto("/about");
  const hero = page.locator("main header").first();
  await expect(hero.getByRole("link", { name: /^CV/ })).toHaveAttribute("href", cvDownload.href);
  await expect(hero.getByRole("link", { name: "See the work" })).toBeVisible();
  await expect(hero.getByRole("link", { name: "Get in touch" })).toBeVisible();
});

test("a CV download is reported to the owner's dashboard once, with no personal data", async ({
  page,
}) => {
  const signals = await recordSignals(page);
  await page.goto("/?hero=fallback");
  const cv = page.locator("[data-hero-actions]").getByRole("link", { name: /^CV/ });
  await cv.evaluate((link) => (link as HTMLElement).click());
  await cv.evaluate((link) => (link as HTMLElement).click());
  await expect.poll(signals).toEqual([
    { url: "/api/track", body: { kind: "page_view", path: "/", referrer: "", detail: "" } },
    { url: "/api/track", body: { kind: "cv_download", path: "/", referrer: "", detail: "" } },
  ]);
});

test("opening a case study is reported as a page view and a case study", async ({ page }) => {
  const signals = await recordSignals(page);
  await page.goto("/saas-dashboards/aligna");
  const path = "/saas-dashboards/aligna";
  await expect.poll(signals).toEqual([
    { url: "/api/track", body: { kind: "page_view", path, referrer: "", detail: "" } },
    { url: "/api/track", body: { kind: "case_study", path, referrer: "", detail: "" } },
  ]);
});

test("?notrack=1 keeps the owner's own device out of the numbers", async ({ page }) => {
  const signals = await recordSignals(page);
  await page.goto("/about?notrack=1");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("portfolio:no-track")))
    .toBe("1");
  await page.goto("/work");
  await page.waitForTimeout(500);
  // The first view can slip out before the flag is read; nothing after it may.
  const sent = (await signals()) as { body: { path: string } }[];
  expect(sent.filter((signal) => signal.body.path === "/work")).toEqual([]);
  await page.goto("/work?notrack=0");
  await expect.poll(async () => ((await signals()) as unknown[]).length).toBeGreaterThan(0);
});
