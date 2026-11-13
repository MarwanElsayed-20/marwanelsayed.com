import { expect, test } from "./fixtures";

// The case study's entrances: the hero
// capture opens out of its centre, each section rises as its top crosses 86% of the screen, and
// lists come in one after another. Phones keep only the rise; reduced motion keeps none.
const path = "/saas-dashboards/wajihni";

test.describe("case study entrance motion", () => {
  test.use({ entranceMotion: true });

  test("the hero capture opens from its centre into the cut-corner shape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as { __clips: string[] }).__clips = [];
      const watch = () => {
        const element = document.querySelector<HTMLElement>('[data-reveal="open"]');
        if (element && element.style.clipPath)
          (window as unknown as { __clips: string[] }).__clips.push(element.style.clipPath);
        requestAnimationFrame(watch);
      };
      requestAnimationFrame(watch);
    });
    await page.goto(path);
    const hero = page.locator('[data-reveal="open"]');
    await expect(hero).toHaveAttribute("data-revealed", "", { timeout: 15_000 });
    await expect
      .poll(() => hero.evaluate((element) => element.style.clipPath), { timeout: 5000 })
      .toBe("");
    const clips = await page.evaluate(() => (window as unknown as { __clips: string[] }).__clips);
    // It started as a point and grew: the first frames are around 50%, the last are the final shape.
    expect(clips[0]).toMatch(/^polygon\(50% 50%/);
    expect(clips.length).toBeGreaterThan(8);
    expect(await hero.evaluate((element) => getComputedStyle(element).clipPath)).toContain(
      "polygon(2%",
    );
  });

  test("a section waits below the 86% line, then rises 46px into place", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-reveal-ready", "");
    const chapter = page.locator('.case-chapter[data-reveal="scene"]').nth(2);
    await chapter.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.93);
    });
    await page.waitForTimeout(600);
    await expect(chapter).not.toHaveAttribute("data-revealed", "");
    expect(await chapter.evaluate((element) => getComputedStyle(element).opacity)).toBe("0");
    await chapter.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.8);
    });
    await expect(chapter).toHaveAttribute("data-revealed", "", { timeout: 5000 });
    await expect
      .poll(() => chapter.evaluate((element) => getComputedStyle(element).opacity), {
        timeout: 5000,
      })
      .toBe("1");
  });

  test("a list comes in one item after another", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const list = page.locator('[data-reveal="stagger"]').first();
    await expect(list).not.toHaveAttribute("data-revealed", "");
    expect(
      await list
        .locator("> *")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("0");
    await list.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - window.innerHeight * 0.7);
    });
    await expect(list).toHaveAttribute("data-revealed", "", { timeout: 5000 });
    await expect
      .poll(
        () =>
          list
            .locator("> *")
            .last()
            .evaluate((el) => getComputedStyle(el).opacity),
        {
          timeout: 5000,
        },
      )
      .toBe("1");
  });

  test("on a phone the capture and lists are simply there, and sections still rise", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const hero = page.locator('[data-reveal="open"]');
    await expect(hero).toHaveAttribute("data-revealed", "", { timeout: 15_000 });
    expect(await hero.evaluate((element) => element.style.clipPath)).toBe("");
    const list = page.locator('[data-reveal="stagger"]').first();
    await list.scrollIntoViewIfNeeded();
    await expect(list).toHaveAttribute("data-revealed", "", { timeout: 5000 });
    expect(
      await list
        .locator("> *")
        .first()
        .evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("1");
  });
});

test.describe("case study without motion", () => {
  test("everything is shown at once, with no hidden state", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    for (const selector of [
      '[data-reveal="scene"]',
      '[data-reveal="stagger"] > *',
      '[data-reveal="open"]',
    ]) {
      const first = page.locator(selector).first();
      expect(await first.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
    expect(
      await page
        .locator('[data-reveal="open"]')
        .evaluate((element) => getComputedStyle(element).clipPath),
    ).toContain("polygon(2%");
  });
});
