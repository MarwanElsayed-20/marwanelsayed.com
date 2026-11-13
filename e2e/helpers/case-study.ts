import { families } from "../../src/content/projects/families";
import { expect, type Page } from "@playwright/test";
import { buildSections } from "../../src/lib/projects/case-study";
import type { Project, ProductProject, SectionId } from "../../src/lib/projects/types";

export async function expectCaseStudy(
  page: Page,
  project: Project | ProductProject,
  kind: SectionId,
) {
  const article = page.locator("main article");
  const sections = buildSections(project, kind);
  await expect(article.getByRole("heading", { level: 1 })).toHaveText(project.title);
  await expect(article.locator("header")).toContainText(project.summary);
  await expect(article.getByRole("heading", { level: 2 })).toHaveText([
    ...sections.map((section) => section.title),
    ...families
      .filter((family) => family.members.some((member) => member.slug === project.slug))
      .map((family) => `Part of ${family.name}`),
  ]);
  await expect(article.locator("a").first()).toHaveAttribute("href", "/work");
  await expect(article.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
    "href",
    "/#contact",
  );
  if (project.image)
    await expect(article.locator("header img")).toHaveAttribute("loading", "eager");
  if (project.image?.kind === "capture")
    await expect(article.locator("header figcaption")).toHaveText(
      "Screens use sample data to protect client information.",
    );
  if (project.scope) await expect(article.locator("header")).toContainText("What I implemented");
  if (sections.length) {
    const outline = article.getByRole("navigation", { name: "On this page", exact: true });
    // Desktop nav or the native mobile disclosure, depending on viewport.
    const details = article.locator("[data-case-study-outline] details");
    if (await details.isVisible()) await details.locator("summary").click();
    await expect(outline.filter({ visible: true }).getByRole("link")).toHaveCount(sections.length);
    for (const section of sections) {
      const link = outline
        .filter({ visible: true })
        .getByRole("link", { name: section.title, exact: true });
      await expect(link).toHaveAttribute("href", `#${section.id}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
      const heading = article.locator(`#${section.id}-heading`);
      await expect(heading).toBeInViewport();
    }
  }
  for (const figure of await article.locator("figure").all()) {
    await expect(figure.locator("img")).toHaveAttribute("alt", /.+/);
    await expect(figure.locator("figcaption")).not.toBeEmpty();
  }
}
