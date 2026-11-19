import type { Page } from "@playwright/test";

/** Records what the page hands to sendBeacon; browsers hide beacon bodies from the test runner. */
export async function recordSignals(page: Page) {
  await page.addInitScript(() => {
    const sent: { url: string; body: unknown }[] = [];
    (window as unknown as { __signals: typeof sent }).__signals = sent;
    navigator.sendBeacon = (url, data) => {
      void (data as Blob)
        .text()
        .then((text) => sent.push({ url: String(url), body: JSON.parse(text) }));
      return true;
    };
  });
  return () => page.evaluate(() => (window as unknown as { __signals: unknown[] }).__signals);
}
