import { homeContent } from "../src/content/site/home";
import { expect, test, type Page } from "./fixtures";

const opacity = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).opacity);

test.describe("entrance motion", () => {
  test.use({ entranceMotion: true });

  test("the hero headline and copy reveal, and stay real, readable text", async ({ page }) => {
    await page.goto("/?hero=fallback");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await expect(
      page.locator("#hero-heading [data-reveal=mask][data-revealed]").first(),
    ).toBeAttached({
      timeout: 10_000,
    });
    await expect.poll(() => opacity(page, "#hero-heading ~ p"), { timeout: 10_000 }).toBe("1");
    await expect(page.locator("#hero-heading")).toContainText(homeContent.headline);
    await expect(page.locator("#hero-heading")).toContainText("Marwan Elsayed");
    // Every word of the headline ends up revealed, none left hidden.
    await expect
      .poll(() => page.locator("#hero-heading [data-reveal=mask]:not([data-revealed])").count())
      .toBe(0);
  });

  test("artwork further down reveals as it is scrolled into view", async ({ page }) => {
    await page.goto("/?hero=fallback");
    const scene = page.locator("#selected-work [data-reveal=clip]").first();
    await expect(scene).not.toHaveAttribute("data-revealed", "");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    await expect(scene.locator("img").first()).toBeVisible();
  });

  test("what is further down stays hidden for as long as it is not near, then reveals", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const intro = "#services p[data-reveal=fade]";
    // Past the ten seconds of the no-scripts last resort, it must still be waiting.
    await page.waitForTimeout(11_000);
    await expect(page.locator(intro)).not.toHaveAttribute("data-revealed", "");
    expect(await opacity(page, intro)).toBe("0");
    await page.locator(intro).scrollIntoViewIfNeeded();
    await expect(page.locator(intro)).toHaveAttribute("data-revealed", "", { timeout: 10_000 });
    await expect.poll(() => opacity(page, intro), { timeout: 10_000 }).toBe("1");
    // Reaching the end of the page must not play what already revealed again.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator(intro).scrollIntoViewIfNeeded();
    expect(await opacity(page, intro)).toBe("1");
  });

  test("text starts revealing as it enters the screen, not once it is well up it", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const line = page.locator("#services p[data-reveal=fade]");
    const top = await line.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const vh = page.viewportSize()!.height;
    // Well below the screen: still waiting.
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - vh * 1.4);
    await page.waitForTimeout(400);
    await expect(line).not.toHaveAttribute("data-revealed", "");
    // Its top a little inside the bottom edge: it has started, and is done well within a second.
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - vh * 0.92);
    await expect(line).toHaveAttribute("data-revealed", "", { timeout: 2_000 });
    await expect
      .poll(() => opacity(page, "#services p[data-reveal=fade]"), { timeout: 1_500 })
      .toBe("1");
  });

  test("the footer waits behind the page and reveals once the page end rises off it", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const link = page.locator("footer[data-uncover] [data-reveal=fade]").first();
    await page.waitForTimeout(1_000);
    await expect(link).not.toHaveAttribute("data-revealed", "");
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await expect(link).toHaveAttribute("data-revealed", "", { timeout: 5_000 });
    await expect
      .poll(() => opacity(page, "footer[data-uncover] [data-reveal=fade]"), { timeout: 3_000 })
      .toBe("1");
  });

  test("keyboard focus inside the covered footer brings the page to its end", async ({ page }) => {
    await page.goto("/?hero=fallback");
    await page.locator("footer[data-uncover] a").first().focus();
    await expect
      .poll(() =>
        page.evaluate(
          () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
        ),
      )
      .toBe(true);
  });

  test("a page that never runs its scripts still shows everything after a delay", async ({
    page,
  }) => {
    test.slow();
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await expect.poll(() => opacity(page, "#hero-heading ~ p"), { timeout: 20_000 }).toBe("1");
  });
});

test.describe("entrance motion is absent", () => {
  test.describe("with reduced motion", () => {
    test.use({ entranceMotion: true, reducedMotion: "reduce" });
    test("content is simply there", async ({ page }) => {
      await page.goto("/?hero=fallback");
      await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
      expect(await opacity(page, "#hero-heading ~ p")).toBe("1");
      await expect(page.locator("#selected-work [data-reveal=clip]").first()).toBeAttached();
    });
  });

  test.describe("without scripting", () => {
    test.use({ entranceMotion: true, javaScriptEnabled: false });
    test("content is simply there", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
      expect(await opacity(page, "#hero-heading ~ p")).toBe("1");
    });
  });
});
