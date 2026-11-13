import { expect, test } from "./fixtures";
import { projects, productProjects } from "../src/lib/projects/repository";
for (const [records, base] of [
  [projects, "/websites-ecommerce"],
  [productProjects, "/saas-dashboards"],
] as const) {
  for (const project of records)
    test(`no demo or source links: ${project.slug}`, async ({ page }) => {
      await page.goto(`${base}/${project.slug}`);
      const article = page.locator("main article");
      await expect(page.locator("body")).not.toContainText(/Live demo|Source code/i);
      // Every case-study link is an internal section, Work/Contact, or neighboring project.
      for (const link of await article.locator("a").all()) {
        const href = await link.getAttribute("href");
        expect(href).toMatch(
          /^(#[a-z]+|\/work|\/#contact|\/(websites-ecommerce|saas-dashboards)\/[a-z0-9-]+)$/,
        );
      }
      // The existing global GitHub profile is a contact link, not a project repository.
      const pageLinks = await page.locator("a").evaluateAll((links) =>
        links.map((link) => ({
          href: link.getAttribute("href") ?? "",
          label: link.textContent ?? "",
        })),
      );
      expect(
        pageLinks.filter(
          (link) =>
            /https?:\/\/(?:www\.)?(?:github\.com|gitlab\.com|bitbucket\.org|sourceforge\.net|codeberg\.org)\/[^/?#]+\/[^/?#]+/i.test(
              link.href,
            ) || /live demo|source code|repository/i.test(link.label),
        ),
      ).toEqual([]);
      if (project.liveLink)
        await expect(page.locator(`a[href="${project.liveLink.url}"]`)).toHaveCount(0);
    });
}
