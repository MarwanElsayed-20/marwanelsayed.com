import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { WorkEntry } from "./work-entry";
import type { WorkEntry as Entry } from "@/lib/projects/work";
afterEach(cleanup);
const entry: Entry = {
  slug: "test",
  title: "Test",
  summary: "Summary",
  category: "Dashboards",
  categoryId: "dashboards",
  section: "digital-products",
  href: "/saas-dashboards/test",
  productLabel: "ToolSwift",
  disclosure: "Real interface, sample data",
  builtWith: ["React"],
};
it("renders a semantic entry, product label, disclosure, technologies and detail links", () => {
  render(
    <ul>
      <WorkEntry entry={entry} />
    </ul>,
  );
  expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Test");
  expect(screen.getByText("ToolSwift")).toBeTruthy();
  expect(screen.getByText(entry.disclosure!)).toBeTruthy();
  expect(screen.getByRole("list", { name: "Built with" }).textContent).toBe("React");
  expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
    entry.href,
    entry.href,
  ]);
});
