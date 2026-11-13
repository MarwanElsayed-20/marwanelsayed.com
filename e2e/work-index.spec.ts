import { expect, test, type Page } from "./fixtures";
import { primaryNav, openMenu } from "./helpers/menu";
import { families } from "../src/content/projects/families";
import { productLabels, workOrder } from "../src/content/projects/work-order";
import { defaultRole, rowRoles } from "../src/content/site/work-page";
import { productProjects, projects } from "../src/lib/projects/repository";
import { buildWorkEntries } from "../src/lib/projects/work";
import { buildWorkRows } from "../src/lib/projects/work-rows";

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
const rows = buildWorkRows(entries, families, {
  roles: rowRoles,
  defaultRole,
  sectionOrder: ["digital-products", "digital-experiences"],
});
const leadSlugs = rows.map((row) => row.slug);
const rowFor = (title: string) => rows.find((row) => row.title === title)!;

const slugs = (page: Page, selector: string) =>
  page
    .locator(selector)
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-work-entry")));

const filterGroup = (page: Page) => page.getByRole("group", { name: "Filter work" });
const row = (page: Page, slug: string) => page.locator(`[data-work-entry="${slug}"]`);
const heading = "Products, stores and dashboards.";

test("/work has one h1, one row per project or ecosystem, each a real link", async ({ page }) => {
  await page.goto("/work");
  await expect(page.locator("main h1")).toHaveText(heading);
  expect(await slugs(page, "[data-work-entry]")).toEqual(leadSlugs);
  await expect(page.locator("#work h3")).toHaveCount(rows.length);
  for (const entry of await page.locator("[data-work-entry]").all()) {
    await expect(entry.locator("h3 a")).toHaveAttribute(
      "href",
      /^\/(websites-ecommerce|saas-dashboards)\//,
    );
  }
  await expect(page.locator('#work a[href^="http"]')).toHaveCount(0);
  // Every project is still reachable: the parts of an ecosystem are links inside its row.
  for (const entry of entries)
    await expect(page.locator(`#work a[href="${entry.href}"]`).first()).toHaveCount(1);
});

test("the page says nothing of employers and does not call itself everything", async ({ page }) => {
  await page.goto("/work");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const word of ["webelocity", "fivem", "freelance"]) expect(text).not.toContain(word);
  expect(text).not.toMatch(/every project|all the work|full work directory|one index/);
  await expect(page.getByText("captures of the real interfaces with sample data")).toBeVisible();
});

test("ToolSwift, Smooth ERP, Hemex and FalconsGT are one row each, parts linked inside", async ({
  page,
}) => {
  await page.goto("/work");
  for (const family of families) {
    const lead = family.members[0].slug;
    await expect(row(page, lead).locator("h3")).toHaveText(family.name);
    await expect(row(page, lead).locator(".index-parts a")).toHaveText(
      family.members.map((member) => member.part),
    );
    for (const member of family.members.slice(1))
      await expect(row(page, member.slug)).toHaveCount(0);
  }
});

test("the rows sit under the two areas of work, SaaS first", async ({ page }) => {
  await page.goto("/work");
  const breaks = page.locator(".index-collection-break");
  await expect(breaks.locator("h2")).toHaveText(["SaaS & Dashboards", "Websites & E-commerce"]);
  const products = rows.filter((candidate) => candidate.section === "digital-products").length;
  await expect(breaks.locator("bdi")).toHaveText([
    `01–${String(products).padStart(2, "0")}`,
    `${String(products + 1).padStart(2, "0")}–${rows.length}`,
  ]);
  await expect(page.locator("#work-digital-products + [data-work-entry]")).toHaveAttribute(
    "data-work-entry",
    "toolswift-customer-dashboard",
  );
  await expect(page.locator("main")).not.toContainText(/automotive websites/i);
});

test("a row names its start year, role, stack, type of work and progress", async ({ page }) => {
  await page.goto("/work");
  const toolswift = row(page, "toolswift-customer-dashboard");
  await expect(toolswift.locator(".index-title-group p")).toContainText("2025 / ");
  await expect(toolswift.locator(".index-title-group p")).not.toContainText(/present|–/);
  await expect(toolswift.locator("small")).toHaveText("Front-end developer");
  await expect(toolswift.locator(".index-disciplines li")).toHaveText(
    rowFor("ToolSwift").categories,
  );
  await expect(toolswift.locator(".status")).toHaveText("In progress");
  await expect(row(page, "wajihni").locator("small")).toHaveText("Full-stack developer");
  await expect(row(page, "smooth-erp").locator("small")).toHaveText("Front-end lead");
  await expect(row(page, "smooth-erp").locator(".status")).toHaveText("Completed");
  await expect(row(page, "falcons-gt-motors").locator(".status")).toHaveText("Completed");
});

test("filters keep order, announce counts and move with the arrow keys", async ({ page }) => {
  await page.goto("/work");
  for (const [label, section] of [
    ["Websites & E-commerce", "digital-experiences"],
    ["SaaS & Dashboards", "digital-products"],
  ] as const) {
    const button = filterGroup(page).getByRole("button", { name: label, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const expected = rows.filter((candidate) => candidate.section === section);
    await expect(page.getByRole("status")).toHaveText(
      `Showing ${expected.length} of ${rows.length}`,
    );
    expect(await slugs(page, "[data-work-entry]:visible")).toEqual(
      expected.map((candidate) => candidate.slug),
    );
  }
  await page.keyboard.press("Home");
  await expect(filterGroup(page).getByRole("button").first()).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toHaveText(`Showing ${rows.length} of ${rows.length}`);
});

test("the area shows in the address and survives a reload", async ({ page }) => {
  await page.goto("/work");
  await filterGroup(page).getByRole("button", { name: "SaaS & Dashboards", exact: true }).click();
  await expect(page).toHaveURL(/\/work\?filter=saas-dashboards$/);
  // Only the area that still has rows keeps its heading.
  await expect(page.locator(".index-collection-break:visible")).toHaveCount(1);
  await page.reload();
  await expect(
    filterGroup(page).getByRole("button", { name: "SaaS & Dashboards", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await filterGroup(page).getByRole("button", { name: "All", exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  expect(await slugs(page, "[data-work-entry]:visible")).toEqual(leadSlugs);
});

for (const [hash, label] of [
  ["websites-ecommerce", "Websites & E-commerce"],
  ["saas-dashboards", "SaaS & Dashboards"],
]) {
  test(`#${hash} on /work selects that filter`, async ({ page }) => {
    await page.goto(`/work#${hash}`);
    await expect(page).toHaveURL(/\/work#work$/);
    await expect(page.locator("#work")).toBeFocused();
    await expect(
      filterGroup(page).getByRole("button", { name: new RegExp(`^${label}`) }),
    ).toHaveAttribute("aria-pressed", "true");
  });
}

test("without JavaScript every row is listed and the filters are absent", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/work");
    await expect(page.locator("[data-work-entry]:visible")).toHaveCount(rows.length);
    await expect(page.locator("[data-work-controls]:visible")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("the menu marks Work as the current page and reaches /work from home", async ({ page }) => {
  await page.goto("/work");
  await openMenu(page);
  await expect(primaryNav(page).locator('a[href="/work"]')).toHaveAttribute("aria-current", "page");
  await page.goto("/");
  await openMenu(page);
  await primaryNav(page).getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL("/work");
  await expect(page.locator("main h1")).toHaveText(heading);
});

for (const width of [360, 768, 1100, 1440])
  test(`/work reflows at ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/work");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

test("a row is one keyboard stop that opens its case study", async ({ page }) => {
  await page.goto("/work");
  const link = page.locator(`[data-work-entry="${leadSlugs[0]}"] h3 a`);
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/${leadSlugs[0]}$`));
});

test.describe("the colour world behind a hovered row", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const engaged = (page: Page) => page.locator(".work-index[data-engaged]");
  const scene = (page: Page, slug: string) =>
    page.locator(`.index-world-scene.is-current[data-world="${slug}"]`);

  test("covers the screen behind the list while a row is hovered, and goes when it leaves", async ({
    page,
  }) => {
    await page.goto("/work");
    await expect(engaged(page)).toHaveCount(0);
    const target = row(page, "aligna");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await expect(engaged(page)).toHaveCount(1);
    await expect(target).toHaveAttribute("data-active", "");
    await expect(scene(page, "aligna")).toHaveCount(1);
    await expect(page.locator(".index-shell")).toHaveAttribute("data-world-active", "");
    // The layer is the whole viewport, fixed behind the rows.
    const box = await page.locator(".work-index-world").boundingBox();
    expect(box).toMatchObject({ x: 0, y: 0, width: 1440 });
    expect(box!.height).toBeGreaterThanOrEqual(880);
    // It is decoration: nothing in it is exposed or can take the pointer.
    await expect(page.locator(".work-index-world")).toHaveAttribute("aria-hidden", "true");
    expect(
      await page
        .locator(".work-index-world")
        .evaluate((element) => getComputedStyle(element).pointerEvents),
    ).toBe("none");
    // Its capture is the project's own, and it says which project it is.
    const capture = scene(page, "aligna").locator(".index-proof-main img");
    await expect
      .poll(() => capture.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(scene(page, "aligna").locator(".index-world-register")).toContainText("Aligna");

    await page.mouse.move(5, 5);
    await expect(engaged(page)).toHaveCount(0);
    await expect(page.locator(".index-world-scene")).toHaveCount(0);
  });

  test("moves to the next row's world, keeping only that one", async ({ page }) => {
    await page.goto("/work");
    const first = row(page, "aligna");
    await first.scrollIntoViewIfNeeded();
    await first.hover();
    await expect(scene(page, "aligna")).toHaveCount(1);
    await row(page, "wajihni").hover();
    await expect(scene(page, "wajihni")).toHaveCount(1);
    await expect(row(page, "wajihni")).toHaveAttribute("data-active", "");
    await expect(first).not.toHaveAttribute("data-active", "");
    // The outgoing world fades out beneath, then is removed.
    await expect(page.locator(".index-world-scene")).toHaveCount(1);
  });

  test("wipes out from the height of the row", async ({ page }) => {
    await page.goto("/work");
    const target = row(page, "aligna");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await expect(scene(page, "aligna")).toHaveCount(1);
    const origin = await page
      .locator(".work-index-world")
      .evaluate((element) => (element as HTMLElement).style.getPropertyValue("--world-origin-y"));
    const box = (await target.boundingBox())!;
    expect(parseInt(origin, 10)).toBeCloseTo(box.y + box.height / 2, -1);
  });

  test("the keyboard brings the world in too, without the pointer's drift", async ({ page }) => {
    await page.goto("/work");
    await page.locator(`[data-work-entry="smooth-erp"] h3 a`).focus();
    await expect(scene(page, "smooth-erp")).toHaveCount(1);
    await expect(page.locator(".work-index-world")).toHaveAttribute("data-input", "keyboard");
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await expect(engaged(page)).toHaveCount(0);
  });

  test("lays the hovered row's own captures, as small static files", async ({ page }) => {
    const requested = new Set<string>();
    page.on("request", (request) => {
      const url = new URL(request.url());
      requested.add(url.searchParams.get("url") ?? url.pathname);
    });
    await page.goto("/work");
    const target = row(page, "wajihni");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await expect(scene(page, "wajihni")).toHaveCount(1);
    const main = scene(page, "wajihni").locator(".index-proof-main img");
    await expect
      .poll(() => main.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(main).toHaveAttribute("src", /\/work-proofs\/wajihni\.webp/);
    // Never the big originals of the case study.
    expect([...requested].filter((source) => source.startsWith("/projects/"))).toEqual([]);
  });

  test("an ecosystem's world lays its lead card and another part's card", async ({ page }) => {
    await page.goto("/work");
    const target = row(page, "toolswift-customer-dashboard");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    const world = scene(page, "toolswift-customer-dashboard");
    await expect(world.locator(".index-proof-second img")).toHaveAttribute(
      "src",
      /toolswift-admin-platform\.webp/,
    );
  });

  test("shows the settled world at once when reduced motion is asked for", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    const target = row(page, "aligna");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await expect(scene(page, "aligna")).toHaveCount(1);
    const state = await scene(page, "aligna").evaluate((element) => {
      const style = getComputedStyle(element);
      return { opacity: style.opacity, clip: style.clipPath };
    });
    expect(state.opacity).toBe("1");
    expect(state.clip).toMatch(
      /^(none|polygon\(0(px|%)? 0(px|%)?, 100% 0(px|%)?, 100% 100%, 0(px|%)? 100%\))$/,
    );
  });

  test("a phone-sized screen keeps the plain list", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/work");
    const target = row(page, "aligna");
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await page.waitForTimeout(400);
    await expect(page.locator(".index-world-scene")).toHaveCount(0);
    await expect(page.locator(".work-index-world")).toBeHidden();
  });
});
