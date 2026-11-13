import { expect, test, type Page } from "../fixtures";

const LIST = "/design-system/digital-products";
const IMAGE_PAGES = ["sample-product-full", "sample-product-screens"];

type ShiftWindow = Window & {
  __shift: number;
  __shiftEntries: { value: number; sources: (string | null)[] }[];
};

async function trackLayoutShift(page: Page) {
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

test.describe("stacked no-JavaScript baseline", () => {
  test.use({ javaScriptEnabled: false });
  for (const width of [1280, 320]) {
    test(`walkthrough images are whole and keep their recorded proportions at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const slug of IMAGE_PAGES) {
        await page.goto(`${LIST}/${slug}`);
        const images = page.locator("#walkthrough figure:visible img");
        const count = await images.count();
        expect(count, slug).toBeGreaterThanOrEqual(3);
        for (let i = 0; i < count; i += 1) {
          const m = await images.nth(i).evaluate((el) => {
            const image = el as HTMLImageElement;
            const frame = image.parentElement as HTMLElement;
            const box = frame.getBoundingClientRect();
            return {
              width: Number(image.getAttribute("width")),
              height: Number(image.getAttribute("height")),
              frameWidth: box.width,
              frameHeight: box.height,
              fit: getComputedStyle(image).objectFit,
              viewport: document.documentElement.clientWidth,
            };
          });
          const label = `${slug} image ${i} at ${width}px`;
          expect(m.fit, label).toBe("contain");
          expect(Math.abs(m.frameWidth / m.frameHeight - m.width / m.height), label).toBeLessThan(
            0.01,
          );
          expect(m.frameWidth, label).toBeLessThanOrEqual(m.viewport);
        }
      }
    });
  }

  test("every figure has descriptive alt text and a caption", async ({ page }) => {
    await page.goto(`${LIST}/sample-product-full`);
    const figures = page.locator("article figure:visible");
    await expect(figures).toHaveCount(4);
    for (const figure of await figures.all()) {
      await expect(figure.locator("img")).toHaveAttribute("alt", /.+/);
      await expect(figure.locator("figcaption")).not.toBeEmpty();
    }
  });

  test("the primary image is eager and every screen is lazy", async ({ page }) => {
    await page.goto(`${LIST}/sample-product-screens`);
    const images = page.locator("article figure:visible img");
    await expect(images).toHaveCount(7);
    await expect(images.first()).toHaveAttribute("loading", "eager");
    for (let i = 1; i < 7; i += 1) {
      await expect(images.nth(i)).toHaveAttribute("loading", "lazy");
    }
    await expect(page.getByRole("heading", { level: 2, name: "Walkthrough" })).toBeVisible();
    await expect(page.locator("#walkthrough noscript > ol > li")).toHaveCount(6);
  });
});

test("images cause no layout shift on pages with many images", async ({ page }) => {
  await trackLayoutShift(page);
  for (const slug of IMAGE_PAGES) {
    const path = `${LIST}/${slug}`;
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const total = await page.evaluate(() => (window as unknown as ShiftWindow).__shift);
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
  await page.goto(`${LIST}/sample-product-screens`);
  await page.waitForLoadState("networkidle");
  const firstLoad = requests.length;
  const firstLoadBytes = (await Promise.all(bodies)).reduce((sum, bytes) => sum + bytes, 0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const afterScroll = requests.length;
  const afterScrollBytes = (await Promise.all(bodies)).reduce((sum, bytes) => sum + bytes, 0);
  const imagesOnPage = await page.locator("article img").count();
  const measurement = { firstLoad, firstLoadBytes, afterScroll, afterScrollBytes, imagesOnPage };
  console.log("Image request measurement (response-body bytes):", JSON.stringify(measurement));
  await test.info().attach("image-request-measurement", {
    body: JSON.stringify(measurement),
    contentType: "application/json",
  });
  test.info().annotations.push({
    type: "image-requests",
    description: `first load: ${firstLoad}, after scrolling: ${afterScroll}, images on page: ${imagesOnPage}; response-body bytes: ${firstLoadBytes} first load, ${afterScrollBytes} after scroll`,
  });
  expect(firstLoad).toBeGreaterThanOrEqual(1);
  expect(afterScroll).toBeGreaterThanOrEqual(firstLoad);
});

test("a failed image keeps its space and does not affect the text", async ({ page }) => {
  await page.route("**/design-system/sample-image/**", (route) => route.abort());
  await page.goto(`${LIST}/sample-product-full`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample product: full page");
  await expect(page.getByText("Sample product context paragraph one.")).toBeVisible();
  const frame = page.locator("article figure > div").first();
  const box = await frame.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(50);
});

test.describe("scripting disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("every framed image and outline is present on a product page", async ({ page }) => {
    await page.goto(`${LIST}/sample-product-full`);
    await expect(page.locator("article figure:visible img")).toHaveCount(4);
    await expect(page.locator("#walkthrough figure:visible figcaption")).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  });
});

for (const width of [1280, 320]) {
  test(`enhanced review viewer retains every sample screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of IMAGE_PAGES) {
      await page.goto(`${LIST}/${slug}`);
      const group = page.getByRole("group", { name: "Walkthrough screens", exact: true });
      const buttons = group.getByRole("button", { name: /^Show screen / });
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < count; i++) {
        await buttons.nth(i).click();
        await expect(buttons.nth(i)).toHaveAttribute("aria-current", "true");
        await expect(group.locator("figure img")).toHaveAttribute("loading", "lazy");
        await expect(group.locator("figure img")).toHaveAttribute("alt", /.+/);
        const m = await group.locator("figure img").evaluate((el) => {
          const box = el.parentElement!.getBoundingClientRect();
          return {
            ratio: box.width / box.height,
            fit: getComputedStyle(el).objectFit,
            width: box.width,
            viewport: innerWidth,
          };
        });
        expect(m.fit).toBe("contain");
        expect(Math.abs(m.ratio - 1.6)).toBeLessThan(0.01);
        expect(m.width).toBeLessThanOrEqual(m.viewport);
        await expect(group.locator("figcaption span:not([aria-hidden])")).not.toBeEmpty();
      }
    }
  });
}
