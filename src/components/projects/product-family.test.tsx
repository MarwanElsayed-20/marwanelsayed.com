import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { familyFor } from "@/lib/projects/families";
import { ProductFamily } from "./product-family";

afterEach(cleanup);
it("labels the section with an h2 and its navigation, keeps the current member out of links", () => {
  const family = familyFor("toolswift-customer-dashboard")!;
  const { container } = render(<ProductFamily family={family} />);
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Part of ToolSwift");
  const section = screen.getByRole("region", { name: "Part of ToolSwift" });
  const nav = within(section).getByRole("navigation", { name: "ToolSwift projects" });
  expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  const current = container.querySelector('[aria-current="page"]')!;
  expect(current.tagName).toBe("DIV");
  expect(current.closest("a")).toBeNull();
  expect(current.querySelector("a")).toBeNull();
  expect(current.textContent).toContain("You are here");
  const links = within(nav).getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual(
    family.members.filter((m) => !m.current).map((m) => m.href),
  );
  expect(container.querySelectorAll("[data-preview-frame]")).toHaveLength(3);
  expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(3);
  for (const link of links)
    expect(link.getAttribute("href")).toMatch(/^\/(saas-dashboards|websites-ecommerce)\//);
  expect(section.textContent).not.toMatch(/live demo|source code|repository/i);
});
it("renders sourced story paragraphs when present", () => {
  render(
    <ProductFamily
      family={{
        ...familyFor("smooth-erp")!,
        story: ["A sourced paragraph.", "A second paragraph."],
      }}
    />,
  );
  expect(screen.getByText("A sourced paragraph.").tagName).toBe("P");
  expect(screen.getByText("A second paragraph.")).toBeTruthy();
});
it("supports a family without a story or captures", () => {
  const family = familyFor("smooth-erp")!;
  const { container } = render(
    <ProductFamily
      family={{
        ...family,
        story: undefined,
        members: family.members.map((member) => ({ ...member, image: undefined })),
      }}
    />,
  );
  expect(container.querySelector("p")).toBeNull();
  expect(container.querySelectorAll("[data-preview-frame]")).toHaveLength(2);
  expect(screen.getAllByRole("link")).toHaveLength(1);
});
it("renders nothing without a family", () => {
  const { container } = render(<ProductFamily />);
  expect(container.innerHTML).toBe("");
});
