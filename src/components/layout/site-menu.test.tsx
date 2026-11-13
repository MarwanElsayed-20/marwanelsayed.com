import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { selectedWorkContent } from "@/content/site/selected-work";
import { selectedScenes } from "@/lib/projects/selected-work";
import { SiteMenu } from "./site-menu";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

afterEach(cleanup);

describe("SiteMenu", () => {
  it("lists the first Selected work scenes by name, each linking to its lead case study", () => {
    render(<SiteMenu />);
    const list = within(screen.getByRole("navigation", { name: "Selected projects" }));
    const links = list.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(
      selectedWorkContent.scenes.slice(0, 3).map((scene) => scene.name),
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      selectedScenes.slice(0, 3).map((scene) => scene.links[0].href),
    );
  });

  it("names the ToolSwift ecosystem and Smooth ERP, not a part of them", () => {
    render(<SiteMenu />);
    const text = screen.getByRole("navigation", { name: "Selected projects" }).textContent ?? "";
    expect(text).toContain("ToolSwift");
    expect(text).toContain("Smooth ERP");
    expect(text).not.toMatch(/dashboard|portal/i);
  });

  it("offers no email address and no Contact entry", () => {
    render(<SiteMenu />);
    expect(screen.queryByRole("link", { name: /@/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Contact" })).toBeNull();
  });
});
