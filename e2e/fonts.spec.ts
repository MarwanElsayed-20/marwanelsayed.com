import { expect, test } from "./fixtures";

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type ShiftWindow = Window & { __shift: number };

test("fonts use swap and load only from the site", async ({ page, baseURL }) => {
  const hosts = new Set<string>();
  page.on("request", (request) => hosts.add(new URL(request.url()).host));

  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Let font layout and the PerformanceObserver settle without waiting on hero requests.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });

  const displays = await page.evaluate(async () => {
    const values: string[] = [];
    const fallbacks: string[] = [];
    const fallbackFamilies: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSFontFaceRule) {
          const source = rule.style.getPropertyValue("src");
          if (source.startsWith("local(")) {
            fallbacks.push(source);
            fallbackFamilies.push(rule.style.getPropertyValue("font-family"));
          } else {
            values.push(rule.style.getPropertyValue("font-display"));
          }
        }
      }
    }
    const availableFallbacks = await Promise.all(
      fallbackFamilies.map(async (family) => ({
        family,
        count: await document.fonts.load(`16px ${family}`).then(
          (faces) => faces.length,
          () => 0,
        ),
      })),
    );
    return { values, fallbacks, availableFallbacks };
  });
  expect(displays.values).toHaveLength(1);
  expect(displays.fallbacks).toHaveLength(2);
  expect(
    displays.availableFallbacks.some(
      (face) => face.family.includes("Inter Tight") && face.count > 0,
    ),
  ).toBe(true);
  expect(displays.fallbacks.every((value) => value.startsWith("local("))).toBe(true);
  expect(displays.values.every((value) => value === "swap")).toBe(true);

  expect([...hosts]).toEqual([new URL(baseURL!).host]);
});

test("fonts cause negligible layout shift @chromium-only", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Requires the Chromium Layout Instability PerformanceObserver API; font loading and direct geometry assertions still run in every engine.",
  );
  await page.addInitScript(() => {
    const target = window as unknown as ShiftWindow;
    target.__shift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) target.__shift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/");
  expect(
    await page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes("layout-shift")),
  ).toBe(true);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });

  const shift = await page.evaluate(() => (window as unknown as ShiftWindow).__shift);
  expect(shift).toBeLessThan(0.01);
});
