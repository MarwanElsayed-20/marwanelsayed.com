import { selectedWorkContent } from "../src/content/site/selected-work";
import { expect, test, type Page } from "./fixtures";

const ids = selectedWorkContent.scenes.map((scene) => scene.id);
const active = (page: Page) =>
  page
    .locator("[data-scene][data-active]")
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.scene));
const trackTop = (page: Page) =>
  page.evaluate(() => {
    const track = document.querySelector("[data-work-track]")!;
    return track.getBoundingClientRect().top + window.scrollY;
  });
const scrollToY = (page: Page, y: number) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);

test.describe("pinned on a wide screen with motion", () => {
  test.use({ entranceMotion: true, viewport: { width: 1440, height: 900 } });

  test("scrolling changes the scene inside one pinned panel, then the panel lets go", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    const top = await trackTop(page);
    const step = 900 * 0.85;
    await scrollToY(page, top);
    await expect.poll(() => active(page)).toEqual(["toolswift"]);
    const panel = page.locator("[data-work-panel]");
    expect(await panel.evaluate((node) => getComputedStyle(node).position)).toBe("sticky");

    for (const [index, id] of ids.entries()) {
      await scrollToY(page, top + index * step);
      await expect.poll(() => active(page), { timeout: 10_000 }).toEqual([id]);
      await expect(page.locator("[data-work-card]")).toHaveAttribute("data-tone", id);
      await expect(page.locator("[data-work-count]")).toHaveText(
        String(index + 1).padStart(2, "0"),
      );
      await expect(page.locator(`[data-work-tab="${id}"]`)).toHaveAttribute("aria-current", "true");
      // The panel stays put while its scenes change.
      expect(Math.round((await panel.boundingBox())!.y)).toBe(0);
    }

    // After the last scene the panel scrolls away into the next section.
    const height = await page.locator("[data-work-track]").evaluate((node) => node.clientHeight);
    await scrollToY(page, top + height);
    await expect(page.locator("#services")).toBeInViewport();
    expect((await panel.boundingBox())!.y).toBeLessThan(0);
  });

  test("tabs and keyboard focus bring their scene in", async ({ page }) => {
    test.slow();
    await page.goto("/?hero=fallback");
    await scrollToY(page, await trackTop(page));
    await expect.poll(() => active(page)).toEqual(["toolswift"]);
    await page.locator('[data-work-tab="wajihni"]').click();
    await expect.poll(() => active(page), { timeout: 15_000 }).toEqual(["wajihni"]);
    // Every scene's case-study link stays in the page for keyboard and screen reader users.
    await page.locator('[data-scene="aligna"] [data-scene-text] a').focus();
    await expect.poll(() => active(page), { timeout: 15_000 }).toEqual(["aligna"]);
    await expect(page.locator('[data-scene="aligna"] [data-scene-title]')).toBeVisible();
  });
});

test.describe("stacked elsewhere", () => {
  test.describe("on a phone", () => {
    test.use({ entranceMotion: true, viewport: { width: 390, height: 844 } });
    test("with motion every scene is its own card and ends fully shown", async ({ page }) => {
      await page.goto("/?hero=fallback");
      expect(
        await page.locator("[data-work-panel]").evaluate((node) => getComputedStyle(node).position),
      ).toBe("static");
      for (const id of ids) {
        const title = page.locator(`[data-scene="${id}"] [data-scene-title]`);
        await title.scrollIntoViewIfNeeded();
        await expect(title).toBeVisible();
      }
      await expect(page.locator("[data-work-tabs]")).toBeHidden();
    });
  });

  test.describe("with reduced motion", () => {
    test.use({
      entranceMotion: true,
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    test("a wide screen stacks the scenes too, with nothing hidden", async ({ page }) => {
      await page.goto("/?hero=fallback");
      expect(
        await page.locator("[data-work-panel]").evaluate((node) => getComputedStyle(node).position),
      ).toBe("static");
      for (const id of ids)
        expect(
          await page
            .locator(`[data-scene="${id}"]`)
            .evaluate((node) => getComputedStyle(node).opacity),
        ).toBe("1");
    });
  });
});
