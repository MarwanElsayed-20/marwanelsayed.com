import { expect, test } from "./fixtures";
import { PUBLIC_PAGES } from "./helpers/pages";

const LEFTOVERS = [/placeholder/i, /later phases?/i, /what is here today/i, /lorem ipsum/i];

test("every internal link resolves, none leads to a review page, and no placeholder text remains", async ({
  page,
}) => {
  test.slow(); // The populated portfolio includes 26 case studies and their full-size captures.
  const queue = ["/"];
  const visited = new Set<string>();
  const checkedAssets = new Set<string>();
  while (queue.length > 0 && visited.size < 80) {
    const path = queue.shift() as string;
    if (visited.has(path)) continue;
    visited.add(path);

    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);

    const hrefs = await page.$$eval("a[href]", (anchors) =>
      anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
    );
    for (const href of hrefs) {
      if (href === "" || href.startsWith("#")) continue;
      if (/^(?:mailto|tel):/i.test(href) || /^https?:\/\//i.test(href)) continue;
      expect(href.startsWith("/design-system"), `${path} links to ${href}`).toBe(false);
      const clean = href.split("#")[0].split("?")[0];
      if (/\.(?:avif|webp|png|jpe?g|svg|pdf)$/i.test(clean)) {
        if (!checkedAssets.has(clean)) {
          checkedAssets.add(clean);
          const asset = await page.request.get(clean);
          expect(asset.status(), `${path} links to ${clean}`).toBe(200);
          await asset.dispose();
        }
        continue;
      }
      if (clean !== "" && !visited.has(clean)) queue.push(clean);
    }

    const text = await page.evaluate(() => document.body.innerText);
    for (const pattern of LEFTOVERS) {
      expect(text, `${path} matches ${pattern}`).not.toMatch(pattern);
    }
  }
  for (const required of PUBLIC_PAGES) {
    expect(visited.has(required), `${required} reached by following links`).toBe(true);
  }
});

test("external links open safely on every public page", async ({ page }) => {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const anchors = await page.$$eval('a[href^="http"]', (nodes) =>
      nodes.map((node) => ({
        href: node.getAttribute("href") ?? "",
        target: node.getAttribute("target"),
        rel: node.getAttribute("rel") ?? "",
        text: node.textContent ?? "",
      })),
    );
    for (const anchor of anchors) {
      expect(anchor.target, `${path} ${anchor.href}`).toBe("_blank");
      expect(anchor.rel, `${path} ${anchor.href}`).toContain("noopener");
      expect(anchor.rel, `${path} ${anchor.href}`).toContain("noreferrer");
      expect(anchor.text, `${path} ${anchor.href}`).toContain("opens in a new tab");
    }
  }
});
