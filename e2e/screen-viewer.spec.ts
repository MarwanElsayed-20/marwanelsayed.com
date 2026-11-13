import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "./fixtures";
import { digitalExperiencesProjects } from "../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../src/content/projects/digital-products";
import { buildSections } from "../src/lib/projects/case-study";
import type { ProjectImage } from "../src/lib/projects/types";

const inventory = [
  ...digitalExperiencesProjects.map((project) => ({
    project,
    href: `/websites-ecommerce/${project.slug}`,
    kind: "digital-experiences" as const,
  })),
  ...digitalProductsProjects.map((project) => ({
    project,
    href: `/saas-dashboards/${project.slug}`,
    kind: "digital-products" as const,
  })),
].map((entry) => ({
  ...entry,
  section: buildSections(entry.project, entry.kind).find((section) => section.id === "walkthrough"),
}));
const multi = inventory.filter((entry) => (entry.section?.screens.length ?? 0) > 1);
const ratio = (image: ProjectImage) => image.height / image.width;
const range = (screens: readonly ProjectImage[]) =>
  Math.max(...screens.map(ratio)) - Math.min(...screens.map(ratio));
const varied = [...multi].sort((a, b) => range(b.section!.screens) - range(a.section!.screens))[0];
const tallest = multi
  .flatMap((entry) => entry.section!.screens.map((image, index) => ({ entry, image, index })))
  .sort((a, b) => ratio(b.image) - ratio(a.image))[0];
const caption = (image: ProjectImage, i: number) => image.caption ?? image.alt ?? `Screen ${i + 1}`;
const alt = (image: ProjectImage, i: number) => image.alt ?? image.caption ?? `Screen ${i + 1}`;
const viewer = (page: Page) =>
  page.getByRole("group", { name: "Walkthrough screens", exact: true });
async function state(group: Locator, screens: readonly ProjectImage[], i: number) {
  await expect(group.locator("figure img")).toHaveAttribute("alt", alt(screens[i], i));
  const src = await group.locator("figure img").getAttribute("src");
  expect(decodeURIComponent(src!)).toContain(screens[i].src);
  await expect(group.locator("figcaption span:not([aria-hidden])")).toHaveText(
    caption(screens[i], i),
  );
  await expect(group.locator("[data-screen-position]").first()).toHaveText(
    `${i + 1} of ${screens.length}`,
  );
  const previous = group.getByRole("button", { name: "Previous", exact: true }).first();
  const next = group.getByRole("button", { name: "Next", exact: true }).first();
  if (i === 0) await expect(previous).toBeDisabled();
  else await expect(previous).toBeEnabled();
  if (i === screens.length - 1) await expect(next).toBeDisabled();
  else await expect(next).toBeEnabled();
  await expect(group.locator("button[aria-current=true]")).toHaveAccessibleName(
    `Show screen ${i + 1}: ${caption(screens[i], i)}`,
  );
  await expect(group.locator("[aria-live]").first()).toHaveText(
    `Screen ${i + 1} of ${screens.length}: ${caption(screens[i], i)}`,
  );
}

test("click-through keeps all screen state, URL, history and scroll together", async ({ page }) => {
  test.slow(); // Walks every screen in both directions, thumbnails, and keyboard controls.
  const entry = multi[0];
  const screens = entry.section!.screens;
  await page.goto(entry.href);
  const group = viewer(page);
  const next = group.getByRole("button", { name: "Next", exact: true });
  await next.scrollIntoViewIfNeeded();
  await next.focus();
  const before = await page.evaluate(() => ({
    url: location.href,
    history: history.length,
    y: scrollY,
  }));
  await state(group, screens, 0);
  for (let i = 1; i < screens.length; i++) {
    await next.click();
    await state(group, screens, i);
  }
  for (let i = screens.length - 2; i >= 0; i--) {
    await group.getByRole("button", { name: "Previous", exact: true }).click();
    await state(group, screens, i);
  }
  expect(
    await page.evaluate(() => ({ url: location.href, history: history.length, y: scrollY })),
  ).toEqual(before);
  for (let i = 0; i < screens.length; i++) {
    const button = group.getByRole("button", {
      name: `Show screen ${i + 1}: ${caption(screens[i], i)}`,
      exact: true,
    });
    await button.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await button.click();
    await state(group, screens, i);
    expect(await page.evaluate(() => scrollY)).toBe(y);
  }
  const focus = group.getByRole("button", {
    name: `Show screen 1: ${caption(screens[0], 0)}`,
    exact: true,
  });
  await focus.focus();
  const keyY = await page.evaluate(() => scrollY);
  for (const [key, i] of [
    ["Home", 0],
    ["ArrowRight", 1],
    ["End", screens.length - 1],
    ["ArrowLeft", screens.length - 2],
  ] as const) {
    await page.keyboard.press(key);
    await state(group, screens, i);
    expect(await page.evaluate(() => scrollY)).toBe(keyY);
  }
  expect(await page.evaluate(() => ({ url: location.href, history: history.length }))).toEqual({
    url: before.url,
    history: before.history,
  });
  await expect(group.getByRole("link")).toHaveCount(0);
});

test("native full-size dialog keeps background inert and restores the opener", async ({ page }) => {
  const entry = multi[0];
  await page.goto(entry.href);
  const group = viewer(page);
  const open = group.getByRole("button", { name: "View full size" });
  await open.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  const url = page.url();
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(
    `${entry.project.title} ${caption(entry.section!.screens[0], 0)}`,
  );
  await dialog.getByRole("button", { name: "Next", exact: true }).click();
  await expect(dialog.getByRole("img")).toHaveAttribute("alt", alt(entry.section!.screens[1], 1));
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press(i < 5 ? "Tab" : "Shift+Tab");
    // Native WebKit dialogs may send Tab to browser chrome, but never to background content.
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement) || !document.hasFocus()),
    ).toBe(true);
  }
  const behind = page.locator("article a").first();
  await behind.evaluate((el: HTMLElement) => el.focus());
  await expect(behind).not.toBeFocused();
  await dialog.getByRole("button", { name: "Close", exact: true }).focus();
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 500);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(page.url()).toBe(url);
  await open.click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(open).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
});

test("phone dialog fits the viewport and tall captures scroll internally", async ({ page }) => {
  const tall = tallest.entry;
  const i = tallest.index;
  await page.setViewportSize({ width: 360, height: 600 });
  await page.goto(tall.href);
  const group = viewer(page);
  await group
    .getByRole("button", {
      name: `Show screen ${i + 1}: ${caption(tall.section!.screens[i], i)}`,
      exact: true,
    })
    .click();
  await group.getByRole("button", { name: "View full size" }).click();
  const dialog = page.getByRole("dialog");
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  expect(box!.height).toBeLessThanOrEqual(600);
  const area = dialog.locator("[data-screen-scroll]");
  await expect(dialog.getByRole("img")).toBeVisible();
  await expect.poll(() => area.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await area.evaluate((el) => {
    el.scrollTop = 100;
  });
  expect(await area.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const entry of inventory) {
  test(`no JavaScript retains ordered captures: ${entry.project.slug}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      await page.goto(entry.href);
      await expect(page.locator("[data-screen-viewer]:visible")).toHaveCount(0);
      const figures = page.locator("#walkthrough figure:visible");
      const images = [...(entry.section?.screens ?? []), ...(entry.section?.responsive ?? [])];
      await expect(figures).toHaveCount(images.length);
      let offset = 0;
      for (const group of [entry.section?.screens ?? [], entry.section?.responsive ?? []]) {
        for (let i = 0; i < group.length; i++) {
          await expect(figures.nth(offset + i).locator("img")).toHaveAttribute(
            "alt",
            alt(group[i], i),
          );
          expect(
            decodeURIComponent(
              (await figures
                .nth(offset + i)
                .locator("img")
                .getAttribute("src"))!,
            ),
          ).toContain(group[i].src);
          await expect(figures.nth(offset + i).locator("figcaption")).toHaveText(
            caption(group[i], i),
          );
        }
        offset += group.length;
      }
    } finally {
      await context.close();
    }
  });
}

for (const width of [360, 768, 1440]) {
  test(`stable frame, caption area, controls and overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(varied.href);
    const group = viewer(page);
    const next = group.getByRole("button", { name: "Next", exact: true });
    await next.scrollIntoViewIfNeeded();
    const layout = () =>
      group.evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        frame: el.querySelector("[data-screen-frame]")!.getBoundingClientRect().height,
        below:
          el.parentElement!.nextElementSibling?.getBoundingClientRect().top ??
          el.getBoundingClientRect().bottom,
      }));
    const before = await layout();
    for (let i = 1; i < varied.section!.screens.length; i++) {
      await next.click();
      expect(await layout()).toEqual(before);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const button of await group.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    if (width === 360) {
      const strip = group.getByRole("list");
      expect(await strip.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
      await strip.evaluate((el) => {
        el.scrollLeft = 100;
      });
      expect(await strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    }
  });
}

test("SSR first screen survives hydration without layout changes", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*.js*", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(multi[0].href, { waitUntil: "commit" });
    const group = viewer(page);
    await expect(group.locator("figure img")).toBeVisible();
    // WebKit's FontFaceSet.ready waits for page load, which the script gate intentionally holds.
    await group.evaluate(async (element) => {
      const normalize = (family: string) => family.replace(/["']/g, "").trim().toLowerCase();
      const families = new Set(
        [element, ...element.querySelectorAll("*")].map((node) =>
          normalize(getComputedStyle(node).fontFamily.split(",")[0]),
        ),
      );
      await Promise.all(
        [...document.fonts]
          .filter((face) => families.has(normalize(face.family)))
          .map((face) => face.load()),
      );
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    const before = await group.boundingBox();
    release();
    await group.getByRole("button", { name: "Next", exact: true }).click();
    const after = await group.boundingBox();
    // Firefox can round the same layout to slightly different floating-point coordinates.
    expect(after!.height).toBeCloseTo(before!.height, 2);
    expect(after!.width).toBeCloseTo(before!.width, 2);
  } finally {
    release();
  }
});

test("reduced motion has no transitions and viewer/dialog pass axe", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(multi[0].href);
  const group = viewer(page);
  const calm = async () => {
    expect(
      await group.evaluate((el) =>
        [el, ...el.querySelectorAll("*")].every((node) => {
          const style = getComputedStyle(node);
          return (
            style.transitionDuration.split(",").every((v) => parseFloat(v) === 0) &&
            style.animationDuration.split(",").every((v) => parseFloat(v) === 0)
          );
        }),
      ),
    ).toBe(true);
  };
  await calm();
  await group.getByRole("button", { name: "Next", exact: true }).click();
  await calm();
  const thumbnail = group.getByRole("button", { name: /Show screen 1:/ });
  await thumbnail.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect(await thumbnail.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  const audit = () =>
    new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
  expect((await audit()).violations).toEqual([]);
  await group.getByRole("button", { name: "View full size" }).click();
  await calm();
  expect((await audit()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await calm();
});

for (const entry of inventory) {
  test(`production screen groups and unchanged outline: ${entry.project.slug}`, async ({
    page,
  }) => {
    await page.goto(entry.href);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.project.title);
    await expect(page.locator("article header")).toContainText(entry.project.summary);
    const sections = buildSections(entry.project, entry.kind);
    const outlines = page.getByRole("navigation", { name: "On this page", exact: true });
    for (const section of sections)
      await expect(outlines.first().locator(`a[href="#${section.id}"]`)).toHaveCount(1);
    const screens = entry.section?.screens ?? [];
    const group = viewer(page);
    if (!entry.section) {
      await expect(page.locator("#walkthrough")).toHaveCount(0);
      await expect(group).toHaveCount(0);
      await expect(outlines.locator('a[href="#walkthrough"]')).toHaveCount(0);
    } else if (screens.length === 1) {
      await expect(group.locator("[data-screen-position]")).toHaveCount(0);
      await expect(group.getByRole("button", { name: /^(Previous|Next|Show screen)/ })).toHaveCount(
        0,
      );
      await group.getByRole("button", { name: "View full size" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
    } else if (screens.length > 1) {
      await state(group, screens, 0);
      await expect(group.getByRole("button", { name: /^Show screen / })).toHaveCount(
        screens.length,
      );
    }
    const responsive = entry.section?.responsive ?? [];
    const secondary = page.getByRole("group", {
      name: "Responsive and states screens",
      exact: true,
    });
    await expect(secondary).toHaveCount(responsive.length ? 1 : 0);
    if (responsive.length) {
      await expect(
        page.getByRole("heading", { name: "Responsive and states", level: 3 }),
      ).toBeVisible();
      await expect(secondary.locator("figure img")).toHaveAttribute("alt", alt(responsive[0], 0));
      if (responsive.length === 1) {
        await expect(secondary.locator("[data-screen-position]")).toHaveCount(0);
        await expect(secondary.getByRole("list")).toHaveCount(0);
      }
      await secondary.getByRole("button", { name: "View full size" }).click();
      await expect(page.getByRole("dialog")).toHaveAccessibleName(
        `${entry.project.title} ${caption(responsive[0], 0)}`,
      );
      await page.keyboard.press("Escape");
      if (screens.length > 1) {
        await group.getByRole("button", { name: "Next", exact: true }).click();
        await state(group, screens, 1);
        await expect(secondary.locator("figure img")).toHaveAttribute("alt", alt(responsive[0], 0));
      }
    }
    expect(new URL(page.url()).pathname).toBe(entry.href);
  });
}
