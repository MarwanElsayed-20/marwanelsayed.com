import { expect, test } from "./fixtures";
import {
  collectErrors,
  expectState,
  headerAction,
  sceneChunkUrls,
  simulateConnection,
  simulateNoWebGL,
  stage,
} from "./helpers/hero";

// These assertions require the software-WebGL scene enabled by Chromium launch flags.
test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    browserName !== "chromium" && testInfo.title.includes("@chromium-only"),
    "Requires the deterministic Chromium software-WebGL scene; fallback coverage runs in all engines.",
  );
});

test("the scene loads and becomes ready @chromium-only", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expectState(page, "ready", "");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the loading state keeps the fallback and all content visible", async ({ page }) => {
  await page.goto("/?hero=hold");
  await expectState(page, "loading", "");
  await expect(stage(page).locator("svg").first()).toBeVisible();
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(headerAction(page)).toBeVisible();
});

const switches = [
  { value: "fallback", reason: "forced" },
  { value: "nowebgl", reason: "no-webgl" },
  { value: "slow", reason: "data-saver" },
  { value: "fail", reason: "load-failed" },
];

for (const { value, reason } of switches) {
  test(`review switch ?hero=${value} shows the fallback with reason ${reason}`, async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(`/?hero=${value}`);
    await expectState(page, "fallback", reason);
    await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
    await expect(stage(page).locator("svg").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/error|failed/i)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("a browser without WebGL gets the fallback", async ({ page }) => {
  await simulateNoWebGL(page);
  await page.goto("/");
  await expectState(page, "fallback", "no-webgl");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
});

test("data-saver mode gets the fallback", async ({ page }) => {
  await simulateConnection(page, { saveData: true });
  await page.goto("/");
  await expectState(page, "fallback", "data-saver");
});

test("a very slow connection gets the fallback", async ({ page }) => {
  await simulateConnection(page, { effectiveType: "2g" });
  await page.goto("/");
  await expectState(page, "fallback", "slow-connection");
});

test("a 3g connection still gets the scene @chromium-only", async ({ page }) => {
  await simulateConnection(page, { effectiveType: "3g" });
  await page.goto("/");
  await expectState(page, "ready");
});

test("reduced motion gets the still fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expectState(page, "fallback", "reduced-motion");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
});

test("turning on reduced motion after load returns to the fallback @chromium-only", async ({
  page,
}) => {
  await page.goto("/");
  await expectState(page, "ready");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectState(page, "fallback", "reduced-motion");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
});

test("losing the graphics context falls back without an error message @chromium-only", async ({
  page,
}) => {
  await page.goto("/");
  await expectState(page, "ready");
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("canvas:not([data-cursor-canvas])");
    const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expectState(page, "fallback", "context-lost");
  await expect(stage(page).locator("svg").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("sustained low frame rate falls back (simulated) @chromium-only", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?hero=lowperf");
  await expectState(page, "fallback", "low-performance", 60_000);
});

test("a blocked scene chunk recovers to the fallback without an uncaught error @chromium-only", async ({
  page,
  browser,
  baseURL,
}) => {
  const chunks = await sceneChunkUrls(browser, baseURL as string);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(
    (url) => chunks.has(url.origin + url.pathname),
    (route) => route.abort(),
  );
  await page.goto("/");
  await expectState(page, "fallback", "load-failed");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
  await expect(stage(page).locator("svg").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(headerAction(page)).toBeVisible();
  expect(errors).toEqual([]);
});
