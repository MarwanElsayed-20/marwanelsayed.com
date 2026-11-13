import { expect, test } from "../fixtures";

const LIST = "/design-system/digital-experiences";

type ShiftWindow = Window & {
  __shift: number;
  __shiftEntries: { value: number; sources: (string | null)[] }[];
};

async function trackLayoutShift(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const w = window as unknown as ShiftWindow;
    w.__shift = 0;
    w.__shiftEntries = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
          sources?: { node?: Node }[];
        };
        if (!shift.hadRecentInput) {
          w.__shift += shift.value;
          w.__shiftEntries.push({
            value: shift.value,
            sources: (shift.sources ?? []).map((source) =>
              source.node instanceof Element ? source.node.outerHTML : null,
            ),
          });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

const shiftTotal = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as ShiftWindow).__shift);

test("an offline project omits offline notices and live links", async ({ page }) => {
  await page.goto(`${LIST}/sample-offline`);
  await expect(page.getByText("This project is no longer online.")).toHaveCount(0);
  await expect(page.locator('article a[target="_blank"]')).toHaveCount(0);
  await expect(page.getByText("Opens the live site in a new tab")).toHaveCount(0);
});

test("a project without an image shows a placeholder frame on its page", async ({ page }) => {
  await page.goto(`${LIST}/sample-no-image`);
  await expect(page.locator("article img")).toHaveCount(0);
  await expect(page.locator("article header [data-preview-frame]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Overview and scope"]);
});

test("unknown review project addresses return 404", async ({ page }) => {
  const response = await page.goto(`${LIST}/not-a-sample`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
});

test("card images are lazy, detail images are eager, and all have dimensions and alt text", async ({
  page,
}) => {
  await page.goto(LIST);
  const cardImages = page.locator("article img");
  const count = await cardImages.count();
  expect(count).toBe(3);
  for (let i = 0; i < count; i += 1) {
    const img = cardImages.nth(i);
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("width", /^\d+$/);
    await expect(img).toHaveAttribute("height", /^\d+$/);
    await expect(img).toHaveAttribute("alt", /.+/);
  }
  await page.goto(`${LIST}/sample-full`);
  await expect(page.locator("article img")).toHaveAttribute("loading", "eager");
});

test("images cause no layout shift on the listing or on pages with images", async ({ page }) => {
  await trackLayoutShift(page);
  for (const path of [
    LIST,
    `${LIST}/sample-full`,
    `${LIST}/sample-portrait`,
    `${LIST}/sample-offline`,
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const total = await shiftTotal(page);
    if (total !== 0)
      console.log(
        "Layout shift entries:",
        path,
        await page.evaluate(() => (window as unknown as ShiftWindow).__shiftEntries),
      );
    expect(total, path).toBe(0);
  }
});

test("measurement: image requests on first load versus after scrolling (report only)", async ({
  page,
}) => {
  const requests: string[] = [];
  const bodies: Promise<number>[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/design-system/sample-image/")) {
      requests.push(response.url());
      bodies.push(response.body().then((body) => body.byteLength));
    }
  });
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto(LIST);
  await page.waitForLoadState("networkidle");
  const firstLoad = requests.length;
  const firstLoadBytes = (await Promise.all(bodies)).reduce((sum, bytes) => sum + bytes, 0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const afterScroll = requests.length;
  const afterScrollBytes = (await Promise.all(bodies)).reduce((sum, bytes) => sum + bytes, 0);
  const measurement = { firstLoad, firstLoadBytes, afterScroll, afterScrollBytes, imagesOnPage: 3 };
  console.log("Image request measurement (response-body bytes):", JSON.stringify(measurement));
  await test.info().attach("image-request-measurement", {
    body: JSON.stringify(measurement),
    contentType: "application/json",
  });
  test.info().annotations.push({
    type: "image-requests",
    description: `first load: ${firstLoad}, after scrolling: ${afterScroll}, images on page: 3; response-body bytes: ${firstLoadBytes} first load, ${afterScrollBytes} after scroll`,
  });
  // Every card image is requested at most once and none is requested that is not on the page.
  expect(afterScroll).toBeLessThanOrEqual(3);
  expect(afterScroll).toBeGreaterThanOrEqual(firstLoad);
});

test("a broken image keeps its frame and does not affect the text", async ({ page }) => {
  await page.route("**/design-system/sample-image/**", (route) => route.abort());
  await page.goto(`${LIST}/sample-full`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample project: full page");
  await expect(page.getByText("Sample context paragraph one.")).toBeVisible();
  const frame = page.locator("article figure > div").first();
  const box = await frame.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(50);
});
