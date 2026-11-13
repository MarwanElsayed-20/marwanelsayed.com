import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { advanceFocus } from "./helpers/keyboard";
import { families } from "../src/content/projects/families";
import { workOrder, productLabels } from "../src/content/projects/work-order";
import { projects, productProjects } from "../src/lib/projects/repository";
import { buildWorkEntries } from "../src/lib/projects/work";

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
const entryFor = (slug: string) => entries.find((entry) => entry.slug === slug)!;

/** Waits until the loader and any page transition have finished; links clicked before that do not navigate. */
async function settled(page: Page) {
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-page-state", /loading|entering/, {
    timeout: 15_000,
  });
  await expect(html).not.toHaveAttribute("data-page-transition", "true", { timeout: 15_000 });
}

test("the work index keeps the approved order within each area, one row per ecosystem", async ({
  page,
}) => {
  await page.goto("/work");
  const listed = async (selector: string) =>
    page
      .locator(selector)
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-work-entry")));
  // ToolSwift opens the list, and every project is in a row or in an ecosystem's row.
  expect((await listed("[data-work-entry]"))[0]).toBe(workOrder[0]);
  const inRows = new Set(await listed("[data-work-entry]"));
  for (const family of families) {
    expect(inRows.has(family.members[0].slug)).toBe(true);
    for (const member of family.members.slice(1)) expect(inRows.has(member.slug)).toBe(false);
    const row = page.locator(`[data-work-entry="${family.members[0].slug}"]`);
    await expect(row.locator("h3")).toHaveText(family.name);
    for (const member of family.members)
      await expect(row.locator(`a[href="${entryFor(member.slug).href}"]`).first()).toHaveCount(1);
  }
  // Family members stay adjacent in the approved order the case-study pages follow.
  for (const family of families) {
    const start = workOrder.indexOf(family.members[0].slug as (typeof workOrder)[number]);
    expect(workOrder.slice(start, start + family.members.length)).toEqual(
      family.members.map((member) => member.slug),
    );
  }
  for (const [label, records] of [
    ["Websites & E-commerce", projects],
    ["SaaS & Dashboards", productProjects],
  ] as const) {
    await page
      .getByRole("group", { name: "Filter work" })
      .getByRole("button", { name: label, exact: true })
      .click();
    const shown = await listed("[data-work-entry]:visible");
    // Every shown row leads a project of that area, in the approved order.
    for (const slug of shown) expect(records.some((record) => record.slug === slug)).toBe(true);
    const positions = shown.map((slug) => workOrder.indexOf(slug as (typeof workOrder)[number]));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  }
  await page
    .getByRole("group", { name: "Filter work" })
    .getByRole("button", { name: "All", exact: true })
    .click();
  expect(await listed("[data-work-entry]:visible")).toHaveLength(inRows.size);
});

for (const entry of entries.filter(
  (entry) =>
    !families.some((family) => family.members.some((member) => member.slug === entry.slug)),
)) {
  test(`no family on non-member: ${entry.slug}`, async ({ page }) => {
    await page.goto(entry.href);
    await expect(page.locator("#product-family-heading")).toHaveCount(0);
    await expect(page.getByRole("region", { name: /^Part of / })).toHaveCount(0);
  });
}

for (const member of families[0].members) {
  test(`ToolSwift story and members: ${member.slug}`, async ({ page }) => {
    await page.goto(entryFor(member.slug).href);
    const block = page.getByRole("region", { name: "Part of ToolSwift", exact: true });
    await expect(block.getByRole("heading", { level: 2 })).toHaveText("Part of ToolSwift");
    await expect(block.locator(".case-copy > p")).toHaveText([...families[0].story!]);
    const items = block.getByRole("listitem");
    await expect(items).toHaveCount(3);
    for (const [i, item] of families[0].members.entries()) {
      await expect(items.nth(i)).toContainText(entryFor(item.slug).title);
      await expect(items.nth(i)).toContainText(item.part);
    }
    const current = block.locator('[aria-current="page"]');
    await expect(current).toContainText(entryFor(member.slug).title);
    await expect(current).toContainText("You are here");
    await expect(current.locator("a")).toHaveCount(0);
    expect(await current.evaluate((el) => el.tagName)).not.toBe("A");
    await expect(block.locator('a[href^="http"], a[target="_blank"]')).toHaveCount(0);
    await expect(block.getByRole("link", { name: /demo|source|repository/i })).toHaveCount(0);
  });
}

for (const family of families)
  for (const member of family.members) {
    test(`siblings, footer and keyboard: ${member.slug}`, async ({ page, browserName }) => {
      // Five page visits, each waiting for the page transition to finish.
      test.slow();
      const entry = entryFor(member.slug);
      await page.goto(entry.href);
      await settled(page);
      const block = page.getByRole("region", { name: `Part of ${family.name}`, exact: true });
      await expect(block.getByRole("listitem")).toHaveCount(family.members.length);
      const links = block.getByRole("link");
      const siblings = family.members.filter((item) => item.slug !== member.slug);
      expect(
        await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
      ).toEqual(siblings.map((item) => entryFor(item.slug).href));
      await expect(block.locator('a[aria-current="page"]')).toHaveCount(0);
      for (const sibling of siblings) {
        const target = entryFor(sibling.slug);
        await block.locator(`a[href="${target.href}"]`).click();
        await expect(page).toHaveURL(target.href, { timeout: 15_000 });
        await expect(page.locator("main h1")).toHaveText(target.title);
        const destination = page.getByRole("region", {
          name: `Part of ${family.name}`,
          exact: true,
        });
        await expect(destination.locator('[aria-current="page"]')).toContainText(target.title);
        await expect(destination.locator('[aria-current="page"] a')).toHaveCount(0);
        await page.goto(entry.href);
        await settled(page);
      }
      const index = entries.indexOf(entry);
      for (const [direction, neighbor] of [
        ["Previous", entries[index - 1]],
        ["Next", entries[index + 1]],
      ] as const) {
        const link = page.getByRole("link", { name: new RegExp(`^${direction} project:`) });
        if (neighbor) await expect(link).toHaveAttribute("href", neighbor.href);
        else await expect(link).toHaveCount(0);
      }
      const footer = page.getByRole("navigation", { name: "More work and contact" });
      await expect(footer.getByRole("link", { name: "Back to Work" })).toHaveAttribute(
        "href",
        "/work",
      );
      await expect(footer.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
        "href",
        "/#contact",
      );
      // Enter from the last outline link, traverse viewer controls, then every sibling with Tab.
      await page.locator("[data-case-study-outline] nav:visible a").last().focus();
      for (const control of await page
        .locator("[data-screen-viewer] button:visible:enabled")
        .all()) {
        await page.keyboard.press("Tab");
        await expect(control).toBeFocused();
      }
      for (const link of await links.all()) {
        await advanceFocus(page, link, browserName);
        await expect(link).toBeFocused();
        expect(
          await link.evaluate((el) => {
            const style = getComputedStyle(el);
            return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
          }),
        ).toBe(true);
        const box = await link.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
      }
    });

    test(`static, reduced-motion and responsive family: ${member.slug}`, async ({
      browser,
      baseURL,
    }) => {
      const context = await browser.newContext({
        baseURL,
        javaScriptEnabled: false,
        reducedMotion: "reduce",
        viewport: { width: 360, height: 800 },
      });
      try {
        const page = await context.newPage();
        await page.goto(entryFor(member.slug).href);
        const block = page.getByRole("region", { name: `Part of ${family.name}`, exact: true });
        for (const width of [360, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(block).toBeVisible();
          await expect(block.locator(".case-copy > p")).toHaveText([...(family.story ?? [])]);
          const items = block.getByRole("listitem");
          for (const [index, item] of family.members.entries()) {
            await expect(items.nth(index)).toContainText(entryFor(item.slug).title);
            await expect(items.nth(index).locator("[data-preview-frame]")).toHaveCount(1);
          }
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            ),
          ).toBe(true);
          const boxes = await items.evaluateAll((nodes) =>
            nodes.map((node) => {
              const r = node.getBoundingClientRect();
              return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
            }),
          );
          for (const [i, a] of boxes.entries())
            for (const b of boxes.slice(i + 1))
              expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y).toBe(
                true,
              );
          expect(await block.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
        }
        await expect(block.locator('a[href^="http"]')).toHaveCount(0);
        await expect(block.getByRole("link", { name: /demo|source|repository/i })).toHaveCount(0);
        const sibling = family.members.find((item) => item.slug !== member.slug)!;
        await block.locator(`a[href="${entryFor(sibling.slug).href}"]`).click();
        await expect(page.locator("main h1")).toHaveText(entryFor(sibling.slug).title);
      } finally {
        await context.close();
      }
    });
  }
