import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtures";
import {
  expectState,
  headerAction,
  openWithPausedHero,
  pauseHeroForAudit,
  sceneChunkUrls,
  stage,
} from "./helpers/hero";

// These assertions require the software-WebGL scene enabled by Chromium launch flags.
test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    browserName !== "chromium" && testInfo.title.includes("@chromium-only"),
    "Requires the deterministic Chromium software-WebGL scene; fallback coverage runs in all engines.",
  );
});

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

type Box = { x: number; y: number; width: number; height: number };

async function boxes(page: Page): Promise<Record<string, Box | null>> {
  return {
    heading: await page.getByRole("heading", { level: 1 }).boundingBox(),
    intro: await page.locator("#hero-heading ~ p").boundingBox(),
    action: await headerAction(page).boundingBox(),
    stage: await stage(page).boundingBox(),
  };
}

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type ShiftWindow = Window & { __shift: number };

test("text is usable before the scene loads and nothing moves when it appears @chromium-only", async ({
  page,
  browser,
  baseURL,
}) => {
  test.slow(); // Scene discovery opens two pages before the delayed loading/CLS check.
  const chunks = await sceneChunkUrls(browser, baseURL as string);
  await page.addInitScript(() => {
    const target = window as unknown as ShiftWindow;
    target.__shift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) target.__shift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.route(
    (url) => chunks.has(url.origin + url.pathname),
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.continue();
    },
  );

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(headerAction(page)).toBeVisible();
  await expect(stage(page)).toHaveAttribute("data-hero-state", /fallback|loading/);
  await expect(stage(page).locator("svg").first()).toBeVisible();
  const before = await boxes(page);

  await expectState(page, "ready");
  const after = await boxes(page);
  for (const key of Object.keys(before)) {
    expect(before[key], key).not.toBeNull();
    for (const prop of ["x", "y", "width", "height"] as const) {
      expect(
        Math.abs((after[key] as Box)[prop] - (before[key] as Box)[prop]),
        `${key}.${prop}`,
      ).toBeLessThan(0.5);
    }
  }
  const shift = await page.evaluate(() => (window as unknown as ShiftWindow).__shift);
  expect(shift).toBeLessThan(0.01);
});

for (const width of [320, 768, 1440]) {
  test(`no horizontal overflow and the stage fits at ${width}px @chromium-only`, async ({
    page,
  }) => {
    test.slow(); // Allow the software-rendered scene to settle before pausing animation time.
    await page.setViewportSize({ width, height: 800 });
    await openWithPausedHero(page);
    await expectState(page, "ready");
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
    const box = await stage(page).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  });
}

test("no horizontal overflow at 200% text size", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test.describe("scripting disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("text and the static visual are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(headerAction(page)).toBeVisible();
    await expect(stage(page).locator("svg").first()).toBeVisible();
    await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
  });
});

test("print shows the text and the static visual, not the canvas @chromium-only", async ({
  page,
}) => {
  await page.goto("/");
  await expectState(page, "ready");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-hero-scene]")).toBeHidden();
  await expect(stage(page).locator("svg").first()).toBeVisible();
  const opacity = await stage(page)
    .locator("svg")
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement as HTMLElement).opacity);
  expect(opacity).toBe("1");
});

test("forced colors keeps the text and the static visual", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await expectState(page, "fallback", "forced");
  await expect(page.locator("canvas:not([data-cursor-canvas])")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(stage(page).locator("svg").first()).toBeVisible();
});

test("the stage never captures pointer, touch, or focus @chromium-only", async ({ page }) => {
  await page.goto("/");
  await expectState(page, "ready");
  const info = await page.evaluate(() => {
    const stageEl = document.querySelector("[data-hero-stage]") as HTMLElement;
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    return {
      stagePointer: getComputedStyle(stageEl).pointerEvents,
      canvasPointer: getComputedStyle(canvas).pointerEvents,
      canvasTouch: getComputedStyle(canvas).touchAction,
      canvasTabindex: canvas.getAttribute("tabindex"),
      stageAria: stageEl.getAttribute("aria-hidden"),
    };
  });
  expect(info.stagePointer).toBe("none");
  expect(info.canvasPointer).toBe("none");
  expect(info.canvasTouch).not.toBe("none");
  expect(info.canvasTabindex).toBeNull();
  expect(info.stageAria).toBe("true");
});

test("the page still scrolls with the wheel over the hero @chromium-only", async ({ page }) => {
  test.slow(); // Software WebGL can delay browser input on Windows.
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto("/");
  await expectState(page, "ready");
  await page.evaluate(() => {
    document
      .querySelector("main")
      ?.insertAdjacentHTML("beforeend", '<div style="height:3000px"></div>');
  });
  const box = await stage(page).boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("keyboard focus never lands on the canvas @chromium-only", async ({ page }) => {
  test.slow(); // Software WebGL can make a complete keyboard walk take longer on Windows.
  await openWithPausedHero(page);
  await expectState(page, "ready");
  const count = await page
    .locator('a[href]:visible, button:visible, [tabindex]:not([tabindex="-1"]):visible')
    .count();
  for (let i = 0; i < count + 1; i += 1) {
    await page.keyboard.press("Tab");
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(tag).not.toBe("CANVAS");
  }
});

for (const scenario of [
  { name: "ready", path: "/", reduced: false, state: "ready" as const },
  { name: "fallback", path: "/?hero=fallback", reduced: false, state: "fallback" as const },
  { name: "reduced motion", path: "/", reduced: true, state: "fallback" as const },
]) {
  test(`no WCAG 2.2 AA violations in the ${scenario.name} state${scenario.state === "ready" ? " @chromium-only" : ""}`, async ({
    page,
  }) => {
    test.slow(); // Full-page audits compete with software WebGL on Windows.
    if (scenario.reduced) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(scenario.path);
    await expectState(page, scenario.state);
    await pauseHeroForAudit(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const width of [360, 1440]) {
  test(`hero heading and intro fit the first screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?hero=fallback");
    for (const locator of [page.locator("#hero-heading"), page.locator("#hero-heading ~ p")]) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(900);
    }
  });
}
