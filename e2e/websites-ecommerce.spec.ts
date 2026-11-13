import { primaryNav } from "./helpers/menu";
import { expectCaseStudy } from "./helpers/case-study";
import { neighbors } from "../src/lib/projects/work";
import { expect, test } from "./fixtures";
import { digitalExperiencesProjects as projects } from "../src/content/projects/digital-experiences";

test("cards open detail pages and back links return to the work index", async ({ page }) => {
  await page.goto("/work");
  const project = projects.find((project) => project.slug === "toolswift-marketing")!;
  await page.locator(`#work a[href="/websites-ecommerce/${project.slug}"]`).click();
  await expect(page).toHaveURL(`/websites-ecommerce/${project.slug}`);
  await expect(page.locator("main h1")).toHaveText(project.title);
  await expect(primaryNav(page).locator("[aria-current]")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "More work and contact" })
      .getByRole("link", { name: "Contact", exact: true }),
  ).toHaveAttribute("href", "/#contact");
  await page.getByRole("link", { name: "Back to Work", exact: true }).first().click();
  await expect(page).toHaveURL("/work");
  await expect(
    page.getByRole("heading", { level: 1, name: "Products, stores and dashboards." }),
  ).toBeVisible();
});
test("browser Back restores the work index", async ({ page }) => {
  await page.goto("/work");
  await page.locator(`#work a[href="/websites-ecommerce/${"toolswift-marketing"}"]`).click();
  await expect(page).toHaveURL(`/websites-ecommerce/${"toolswift-marketing"}`);
  await expect(page.locator("main h1")).toHaveText(
    projects.find((project) => project.slug === "toolswift-marketing")!.title,
  );
  await page.goBack();
  await expect(page).toHaveURL("/work");
  await expect(page.locator("#work")).toBeInViewport();
});
for (const project of projects)
  test(`${project.slug} keeps its content and address`, async ({ page }) => {
    const response = await page.goto(`/websites-ecommerce/${project.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toHaveText(project.title);
    await expect(page.locator("main")).toContainText(project.summary);
    await expectCaseStudy(page, project, "digital-experiences");
    const adjacent = neighbors(project.slug);
    for (const [direction, entry] of [
      ["Previous", adjacent.previous],
      ["Next", adjacent.next],
    ] as const) {
      const link = page.getByRole("link", { name: new RegExp(`^${direction} project:`) });
      if (entry) {
        await expect(link).toHaveAttribute("href", entry.href);
        await expect(link).toContainText(entry.title);
        if (direction === "Next") await expect(page.getByText("Continue exploring")).toBeVisible();
      } else await expect(link).toHaveCount(0);
    }
  });
