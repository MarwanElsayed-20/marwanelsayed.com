import { expect, test } from "./fixtures";

test("focus stays visible in forced-colors mode", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const visible = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as HTMLElement);
    return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
  });
  expect(visible).toBe(true);
});

for (const path of ["/", "/this-page-does-not-exist"]) {
  test(`no horizontal overflow at 200% text size on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(path);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
}
