import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CaseStudyNeighbors } from "./case-study-neighbors";
import type { WorkEntry } from "@/lib/projects/work";
afterEach(cleanup);
const entry: WorkEntry = {
  slug: "test",
  title: "Test",
  summary: "Summary",
  category: "Dashboard",
  categoryId: "dashboards",
  section: "digital-products",
  href: "/saas-dashboards/test",
};
it("names the next project large, the previous one, Work and Contact with correct addresses", () => {
  render(
    <CaseStudyNeighbors
      previous={entry}
      next={{ ...entry, title: "Next", href: "/saas-dashboards/next" }}
    />,
  );
  expect(screen.getByRole("link", { name: "Previous project: Test" }).getAttribute("href")).toBe(
    entry.href,
  );
  expect(screen.getByRole("link", { name: "Next project: Next" })).toBeTruthy();
  expect(screen.getByText("Continue exploring")).toBeTruthy();
  expect(screen.getByText(/Next: Summary/)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Back to Work" }).getAttribute("href")).toBe("/work");
  expect(screen.getByRole("link", { name: "Contact" }).getAttribute("href")).toBe("/#contact");
});
it("omits missing directions without looping", () => {
  render(<CaseStudyNeighbors next={entry} />);
  expect(screen.queryByRole("link", { name: /Previous project/ })).toBeNull();
  expect(screen.getByRole("link", { name: /Next project/ })).toBeTruthy();
});
