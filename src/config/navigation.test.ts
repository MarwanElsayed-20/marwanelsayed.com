import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { navItems } from "./navigation";

const appDir = join(process.cwd(), "src", "app");

function pageExists(href: string): boolean {
  const segments = href.split("#")[0].split("/").filter(Boolean);
  return existsSync(join(appDir, ...segments, "page.tsx"));
}

describe("navItems", () => {
  it("has at least one item", () => {
    expect(navItems.length).toBeGreaterThan(0);
  });

  it("has unique, non-empty labels", () => {
    const labels = navItems.map((item) => item.label);
    expect(labels.every((label) => label.trim().length > 0)).toBe(true);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has unique absolute hrefs", () => {
    const hrefs = navItems.map((item) => item.href);
    expect(hrefs.every((href) => href.startsWith("/"))).toBe(true);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("only links to routes that exist", () => {
    for (const item of navItems) {
      expect(pageExists(item.href), item.href).toBe(true);
    }
  });

  it("never links to review pages", () => {
    expect(navItems.some((item) => item.href.startsWith("/design-system"))).toBe(false);
  });
});

it("lists the routes in navigation order, with no contact entry", () => {
  expect(navItems.map((item) => item.href)).toEqual(["/", "/work", "/services", "/about"]);
});
