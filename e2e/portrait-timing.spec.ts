import { expect, test } from "./fixtures";

/** Records what covered the page at the moment the portrait was marked revealed. */
const watchPortrait = () => {
  const record = () => {
    const html = document.documentElement;
    (window as unknown as { portraitAt: unknown }).portraitAt = {
      loader: html.dataset.loader ?? null,
      transition: html.dataset.pageTransition ?? null,
      state: html.dataset.pageState ?? null,
    };
  };
  new MutationObserver((changes) => {
    for (const change of changes) {
      const target = change.target as HTMLElement;
      if (target.hasAttribute?.("data-about-portrait") && target.hasAttribute("data-revealed"))
        record();
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-revealed"] });
};

const covered = (at: { loader: string | null; transition: string | null; state: string | null }) =>
  at.loader === "active" || at.transition === "true" || at.state === "entering";

test.describe("with entrance motion", () => {
  test.use({ entranceMotion: true });

  test("the portrait plays after the Loading card has lifted, not under it", async ({ page }) => {
    // A page change can take most of a minute under software rendering.
    test.setTimeout(150_000);
    await page.addInitScript(watchPortrait);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // The footer sits under the page until the end, so the link is clicked by script.
    await page.locator("footer a[href='/about']").evaluate((link) => (link as HTMLElement).click());
    await page.waitForFunction(
      () => (window as unknown as { portraitAt?: unknown }).portraitAt !== undefined,
      undefined,
      { timeout: 100_000 },
    );
    const at = await page.evaluate(
      () =>
        (
          window as unknown as {
            portraitAt: { loader: string | null; transition: string | null; state: string | null };
          }
        ).portraitAt,
    );
    expect(covered(at), JSON.stringify(at)).toBe(false);
  });
});

test.describe("on a first visit that starts on /about", () => {
  test.use({ entranceMotion: true, introSeen: false });

  // The intro plays only when a visit starts on the home page, so it can never cover the portrait.
  test("the opening loader stays away and the portrait plays uncovered", async ({ page }) => {
    test.setTimeout(150_000);
    await page.addInitScript(watchPortrait);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    await page.waitForFunction(
      () => (window as unknown as { portraitAt?: unknown }).portraitAt !== undefined,
      undefined,
      { timeout: 100_000 },
    );
    const at = await page.evaluate(
      () =>
        (
          window as unknown as {
            portraitAt: { loader: string | null; transition: string | null; state: string | null };
          }
        ).portraitAt,
    );
    expect(at.loader, JSON.stringify(at)).not.toBe("active");
    expect(covered(at), JSON.stringify(at)).toBe(false);
  });
});
