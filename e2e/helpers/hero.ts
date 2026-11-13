import { expect, type Browser, type Page } from "@playwright/test";

/** The header's "Get in touch" link: the page's primary action now that the hero has none. */
export const headerAction = (page: Page) =>
  page.locator("[data-site-header]").getByRole("link", { name: "Get in touch" });

export const stage = (page: Page) => page.locator("[data-hero-stage]");

/** Keep the rendered scene in static checks without software WebGL starving browser input. */
export async function openWithPausedHero(page: Page, path = "/") {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto(path, { waitUntil: "domcontentloaded" });
  if ((await stage(page).count()) > 0) {
    await expect
      .poll(
        () =>
          stage(page).evaluate(
            (element) =>
              element.getAttribute("data-hero-state") === "ready" ||
              Boolean(element.getAttribute("data-hero-reason")),
          ),
        { timeout: 30_000 },
      )
      .toBe(true);
  }
  // Jump forward once, then hold requestAnimationFrame while preserving the actual canvas/DOM.
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
}

export async function expectState(
  page: Page,
  state: "fallback" | "loading" | "ready",
  reason?: string,
  timeout = 30_000,
) {
  await expect(stage(page)).toHaveAttribute("data-hero-state", state, { timeout });
  if (reason !== undefined) {
    await expect(stage(page)).toHaveAttribute("data-hero-reason", reason, { timeout });
    await expect(stage(page)).toHaveAttribute("data-hero-state", state, { timeout });
  }
}

/** Pause offscreen decorative WebGL during a full-page audit; all DOM content stays available. */
export async function pauseHeroForAudit(page: Page) {
  if ((await stage(page).count()) === 0) return;
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      stage(page).evaluate(
        (element) =>
          element.getAttribute("data-hero-paused") === "true" ||
          Boolean(element.getAttribute("data-hero-reason")),
      ),
    )
    .toBe(true);
}

/** Makes every WebGL context request fail, as in a browser without WebGL. */
export async function simulateNoWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (/webgl/i.test(type)) return null;
      return (original as unknown as (...args: unknown[]) => unknown).call(this, type, ...rest);
    } as unknown as typeof original;
  });
}

/** Defines navigator.connection with the given signals before any page script runs. */
export async function simulateConnection(
  page: Page,
  connection: { saveData?: boolean; effectiveType?: string },
) {
  await page.addInitScript((value) => {
    Object.defineProperty(navigator, "connection", { configurable: true, get: () => value });
  }, connection);
}

/** Collects the URLs (origin plus path) of every JavaScript file the page requests. */
export function trackScripts(page: Page): Set<string> {
  const urls = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith(".js")) urls.add(url.origin + url.pathname);
  });
  return urls;
}

/** Console and page errors, ignoring driver messages printed by software WebGL. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/GL Driver Message|GPU stall/i.test(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

const cache = new Map<string, Set<string>>();

/**
 * Finds the JavaScript files that only the 3D scene needs: the files requested by a normal home page
 * load minus the files requested when the scene is forced off. Cached per worker.
 */
export async function sceneChunkUrls(browser: Browser, baseURL: string): Promise<Set<string>> {
  const cached = cache.get(baseURL);
  if (cached) return cached;

  const context = await browser.newContext({ baseURL });
  await context.addInitScript(() => sessionStorage.setItem("portfolio:intro-seen", "1"));
  const withScene = await context.newPage();
  const withSceneUrls = trackScripts(withScene);
  await withScene.goto("/");
  await expectState(withScene, "ready");
  await withScene.close();

  const withoutScene = await context.newPage();
  const withoutSceneUrls = trackScripts(withoutScene);
  await withoutScene.goto("/?hero=fallback");
  await expectState(withoutScene, "fallback", "forced");
  await withoutScene.waitForLoadState("networkidle");

  const diff = new Set([...withSceneUrls].filter((url) => !withoutSceneUrls.has(url)));
  await context.close();
  expect(diff.size).toBeGreaterThan(0);
  cache.set(baseURL, diff);
  return diff;
}
