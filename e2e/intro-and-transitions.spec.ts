import { workOrder } from "../src/content/projects/work-order";
import { digitalProductsProjects } from "../src/content/projects/digital-products";
import { expect, test } from "./fixtures";
import { expectMenuClosed, menuToggle, openMenu } from "./helpers/menu";

// The first project in Work order is always in the initially visible set.
const FIRST = digitalProductsProjects.find((project) => project.slug === workOrder[0])!;
const projectPath = `/saas-dashboards/${FIRST.slug}`;
const html = (page: import("@playwright/test").Page) => page.locator("html");

test.describe("opening sequence", () => {
  test.use({ introSeen: false });

  test("plays on a first visit, follows real progress, then hands the page over", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback", { waitUntil: "domcontentloaded" });
    await expect(html(page)).toHaveAttribute("data-loader", "active");
    const root = page.locator("[data-loader-root]");
    await expect(root).toBeVisible();
    await expect(root).toContainText("Marwan Elsayed");
    // The page behind it cannot be reached while the intro is up.
    await expect(page.locator("main")).toHaveAttribute("inert", "");
    const counts: number[] = [];
    await expect
      .poll(
        async () => {
          const value = Number(await page.locator("[data-loader-count]").textContent());
          counts.push(value);
          return html(page).getAttribute("data-loader");
        },
        { timeout: 15_000, intervals: [100] },
      )
      .toBe("done");
    expect(Math.max(...counts)).toBeGreaterThan(50);
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
    await expect(root).toBeHidden();
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
    await expect(html(page)).not.toHaveAttribute("data-page-state", "loading");
    expect(await page.evaluate(() => sessionStorage.getItem("portfolio:intro-seen"))).toBe("1");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      "visible",
    );
  });

  test("does not replay on refresh or on another page in the same session", async ({ page }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    await expect(html(page)).toHaveAttribute("data-loader", "done", { timeout: 15_000 });
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-loader", "done");
    await expect(page.locator("[data-loader-root]")).toBeHidden();
    await page.goto(projectPath);
    await expect(html(page)).toHaveAttribute("data-loader", "done");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(FIRST.title);
  });

  test("a project page opened directly still plays the intro once and then works", async ({
    page,
  }) => {
    test.slow();
    await page.goto(projectPath);
    await expect(html(page)).toHaveAttribute("data-loader", "done", { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(FIRST.title);
  });

  test("a failing font download cannot hold the intro", async ({ page }) => {
    test.slow();
    await page.route("**/*.woff2", (route) => route.abort());
    await page.goto("/?hero=fallback", { waitUntil: "domcontentloaded" });
    await expect(html(page)).toHaveAttribute("data-loader", "done", { timeout: 15_000 });
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  });
});

test.describe("opening sequence is skipped", () => {
  test.use({ introSeen: false, reducedMotion: "reduce" });

  test("with reduced motion", async ({ page }) => {
    await page.goto("/?hero=fallback");
    await expect(html(page)).toHaveAttribute("data-loader", "done");
    await expect(page.locator("[data-loader-root]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("opening sequence without scripting", () => {
  test.use({ introSeen: false, javaScriptEnabled: false });

  test("never covers the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-loader-root]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("page transitions", () => {
  test("cover, change route, uncover, and leave the page usable", async ({ page }) => {
    test.slow();
    await page.goto("/work");
    const link = page.locator(`#work h3 a[href="${projectPath}"]`);
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page.locator("[data-curtain]")).toBeVisible();
    await expect(page).toHaveURL(projectPath, { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(FIRST.title);
    await expect(page.locator("[data-curtain]")).toBeHidden({ timeout: 10_000 });
    await expect(html(page)).not.toHaveAttribute("data-page-state", "entering");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      "visible",
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("back and forward behave like the browser and never stick", async ({ page }) => {
    test.slow();
    await page.goto("/work");
    await page.locator(`#work h3 a[href="${projectPath}"]`).click();
    await expect(page).toHaveURL(projectPath, { timeout: 20_000 });
    await expect(page.locator("[data-curtain]")).toBeHidden({ timeout: 10_000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("#work")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(projectPath, { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(FIRST.title);
    await expect(page.locator("[data-curtain]")).toBeHidden();
  });

  test("rapid clicks on two destinations end on one coherent page", async ({ page }) => {
    test.slow();
    await page.goto("/work");
    const [first, second] = [workOrder[0], workOrder[1]];
    const a = page.locator(`#work a[href$="/${first}"]`).first();
    const b = page.locator(`#work a[href$="/${second}"]`).first();
    await a.click();
    // A second activation while the first transition runs is ignored rather than stacked.
    await b.click({ force: true, noWaitAfter: true }).catch(() => {});
    await expect(page.locator("[data-curtain]")).toBeHidden({ timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(`/${first}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      "visible",
    );
  });

  test("a link clicked while the new page is still growing in still navigates", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/work");
    await page.locator(`#work h3 a[href="${projectPath}"]`).click();
    await expect(page).toHaveURL(projectPath, { timeout: 20_000 });
    // The arrived page grows to fill the screen while the "Loading" card leaves to the left.
    // A click part-way through that must not be lost (it used to hang the next change).
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const label = document.querySelector("[data-curtain-card]");
            return label ? new DOMMatrix(getComputedStyle(label).transform).m41 : 0;
          }),
        { timeout: 15_000 },
      )
      .toBeLessThan(-20);
    await page.waitForTimeout(900);
    await expect(html(page)).toHaveAttribute("data-page-transition", "true");
    await page
      .getByRole("link", { name: "Back to Work", exact: true })
      .first()
      .dispatchEvent("click");
    await expect(page).toHaveURL("/work", { timeout: 20_000 });
    await expect(page.locator("[data-curtain]")).toBeHidden({ timeout: 15_000 });
    await expect(html(page)).not.toHaveAttribute("data-page-state", "entering");
    await expect(html(page)).not.toHaveAttribute("data-page-transition", "true");
  });

  test("from the open menu the page card carries on into the transition, then the menu is gone", async ({
    page,
  }) => {
    test.slow();
    await page.goto(projectPath);
    await openMenu(page);
    await page.locator('nav[aria-label="Primary"]').getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/", { timeout: 20_000 });
    await expect(page.locator("[data-curtain]")).toBeHidden({ timeout: 15_000 });
    await expectMenuClosed(page);
    await expect(page.locator("#selected-work")).toBeVisible();
  });

  test("modified clicks and new-tab links stay native", async ({ page, context }) => {
    test.slow();
    await page.goto("/work");
    const link = page.locator(`#work h3 a[href="${projectPath}"]`);
    await link.scrollIntoViewIfNeeded();
    const popup = context.waitForEvent("page");
    await link.click({ modifiers: ["Control"] });
    const opened = await popup;
    await opened.close();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("[data-curtain]")).toBeHidden();
  });
});

test.describe("page transitions with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("navigate instantly without a curtain", async ({ page }) => {
    await page.goto("/work");
    await page.locator(`#work h3 a[href="${projectPath}"]`).click();
    await expect(page).toHaveURL(projectPath, { timeout: 20_000 });
    await expect(page.locator("[data-curtain]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(FIRST.title);
  });
});

test.describe("cursor", () => {
  test("appears with the pointer, treats previews as plain links, and keeps the native pointer", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    const cursor = page.locator("[data-cursor-root]");
    await expect(cursor).toHaveAttribute("data-cursor-visible", "false");
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 320);
    await expect(cursor).toHaveAttribute("data-cursor-visible", "true");
    // The system pointer is never hidden: the ink cursor trails it.
    expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
    // Project previews are plain links: no "View" disc, the ink simply pauses over them.
    const preview = page.locator("#selected-work [data-intro-print]").first();
    await preview.scrollIntoViewIfNeeded();
    await preview.hover();
    await expect(cursor).toHaveAttribute("data-cursor-state", "link");
    await page.locator("#selected-work [data-scene-text] a").first().hover();
    await expect(cursor).toHaveAttribute("data-cursor-state", "link");
    await page.locator("#services-heading").hover();
    await expect(cursor).toHaveAttribute("data-cursor-state", "default");
    await expect(cursor.getByText("View")).toHaveCount(0);
    // It never intercepts clicks.
    await menuToggle(page).click();
    await expect(menuToggle(page)).toHaveAttribute("aria-expanded", "true");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("is not mounted and the native cursor stays", async ({ page }) => {
      await page.goto("/?hero=fallback");
      await page.mouse.move(200, 200);
      await expect(page.locator("[data-cursor-root]")).toHaveCount(0);
      await expect(html(page)).not.toHaveAttribute("data-custom-cursor", "true");
    });
  });

  test.describe("on a touch device", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });
    test("is not mounted", async ({ page }) => {
      await page.goto("/?hero=fallback");
      await expect(page.locator("[data-cursor-root]")).toHaveCount(0);
      await expect(html(page)).not.toHaveAttribute("data-custom-cursor", "true");
    });
  });
});
