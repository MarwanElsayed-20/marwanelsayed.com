import { expect, test, type Page } from "./fixtures";

const requestedProofs = (page: Page) => {
  const requested = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    const source = url.searchParams.get("url") ?? url.pathname;
    if (source.startsWith("/projects/") || source.startsWith("/work-proofs/"))
      requested.add(source);
  });
  return requested;
};

// A screen with colour worlds gets each row's first capture in the background once the page is idle,
// so the first hover finds it ready; a phone fetches no capture at all.
test("on a wide screen the rows' captures are fetched ahead, as small files", async ({ page }) => {
  const requested = requestedProofs(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work");
  await expect
    .poll(() => [...requested].filter((source) => source.endsWith(".webp")).length, {
      timeout: 30_000,
    })
    .toBeGreaterThanOrEqual(15);
  expect(requested.has("/work-proofs/toolswift-customer-dashboard.webp")).toBe(true);
  expect([...requested].filter((source) => source.startsWith("/projects/"))).toEqual([]);
});

test("a phone fetches no capture on the work page", async ({ page }) => {
  const requested = requestedProofs(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/work");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(4000);
  expect([...requested]).toEqual([]);
});
