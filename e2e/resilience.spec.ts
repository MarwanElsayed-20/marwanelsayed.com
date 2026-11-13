import { expect, test } from "./fixtures";
import { navItems } from "../src/config/navigation";

const PAGES = ["/", "/websites-ecommerce/mdr-electrical-supply"];

for (const width of [375, 768, 1280]) {
  test(`navigation links stay in place while fonts load at ${width}px`, async ({ page }) => {
    let releaseFonts: () => void = () => {};
    const fontsReady = new Promise<void>((resolve) => {
      releaseFonts = resolve;
    });
    await page.route("**/*.woff2", async (route) => {
      await fontsReady;
      await route.continue();
    });
    await page.setViewportSize({ width, height: 900 });
    try {
      await page.goto("/websites-ecommerce/mdr-electrical-supply", {
        waitUntil: "domcontentloaded",
      });
      // Measure each navigation's own layout. Body font reflow may move the footer down
      // the document without moving links within it; case-study links are separate.
      const links = page
        .getByRole("navigation", { name: /^(Primary|Footer)$/ })
        .locator("a:visible");
      await expect(links).toHaveCount(navItems.length);
      const downloadedFontState = () => {
        const normalize = (family: string) => family.replace(/["']/g, "").trim().toLowerCase();
        const family = normalize(getComputedStyle(document.body).fontFamily.split(",")[0]);
        const faces = [...document.fonts].filter((face) => normalize(face.family) === family);
        return {
          registered: faces.length > 0,
          loaded: faces.length > 0 && faces.every((face) => face.status === "loaded"),
        };
      };
      // Compare the adjusted local fallback with the downloaded font, rather than measuring
      // an intermediate layout before the browser's local font lookup has completed.
      const fallbackReady = await page.evaluate(async () => {
        const [arial, dejavu] = await Promise.all(
          ["Inter Tight Metrics Fallback", "Inter Tight Linux Metrics Fallback"].map((family) =>
            document.fonts.load(`16px "${family}"`).catch(() => []),
          ),
        );
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        return {
          available: arial.length > 0 || dejavu.length > 0,
        };
      });
      expect(fallbackReady.available).toBe(true);
      expect(await page.evaluate(downloadedFontState)).toEqual({ registered: true, loaded: false });
      const positions = () =>
        links.evaluateAll((elements) =>
          elements.map((element) => {
            const box = element.getBoundingClientRect();
            const navigation = element.closest("nav")!.getBoundingClientRect();
            return {
              x: box.x,
              y: element.closest("footer") ? box.y - navigation.y : box.y,
              height: box.height,
            };
          }),
        );
      const before = await positions();
      releaseFonts();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(downloadedFontState)).toEqual({ registered: true, loaded: true });
      const after = await positions();
      expect(after).toHaveLength(before.length);
      for (let index = 0; index < before.length; index += 1) {
        for (const dimension of ["x", "y", "height"] as const) {
          // Engines round document coordinates differently after a long page reflows.
          expect(after[index][dimension], `link ${index} ${dimension}`).toBeCloseTo(
            before[index][dimension],
            1,
          );
        }
      }
    } finally {
      releaseFonts();
    }
  });
}

for (const path of PAGES) {
  test(`${path} stays readable and does not overflow with images and fonts blocked`, async ({
    page,
  }) => {
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      return type === "image" || type === "font" ? route.abort() : route.continue();
    });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const textLength = await page.evaluate(
      () => document.querySelector("main")?.innerText.length ?? 0,
    );
    expect(textLength).toBeGreaterThan(0);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}

test("a very long site name still fits at 320px and keeps the menu button reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    const logo = document.querySelector("header a");
    if (logo) logo.textContent = "Extraordinarily Long Studio Name For Layout Testing Purposes";
  });
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
  const box = await page.getByRole("button", { name: "Menu" }).boundingBox();
  expect(box).not.toBeNull();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
});
