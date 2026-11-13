import type { Locator, Page } from "@playwright/test";

export const FOCUSABLE =
  'a[href]:visible, button:visible:enabled, [tabindex]:not([tabindex="-1"]):visible';

/** Windows WebKit's default keyboard UI mode excludes implicit links from Tab traversal. */
export function hasControlOnlyTabbing(browserName: string) {
  return browserName === "webkit" && process.platform === "win32";
}

/**
 * Keep native Tab-order coverage where available. Windows WebKit has no Playwright option
 * for its tab-to-links preference, so check those links' focusability without rewriting DOM.
 * Native Tab still establishes keyboard modality and traverses controls in that engine.
 */
export async function advanceFocus(page: Page, target: Locator, browserName: string) {
  if (
    hasControlOnlyTabbing(browserName) &&
    (await target.evaluate((element) => element.matches("a[href]:not([tabindex])")))
  ) {
    await target.focus();
  } else {
    await page.keyboard.press("Tab");
  }
}
