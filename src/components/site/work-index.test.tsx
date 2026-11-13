import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { families } from "@/content/projects/families";
import { workOrder, productLabels } from "@/content/projects/work-order";
import { defaultRole, rowRoles } from "@/content/site/work-page";
import { projects, productProjects } from "@/lib/projects/repository";
import { buildWorkEntries } from "@/lib/projects/work";
import { buildWorkRows } from "@/lib/projects/work-rows";
import { hoverTiming } from "@/lib/work-world";
import { WorkIndex } from "./work-index";

/** jsdom has no matchMedia: answer every query the way a wide screen with a mouse would. */
function stubScreen(wide: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: wide,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  stubScreen(true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
const rows = buildWorkRows(entries, families, {
  roles: rowRoles,
  defaultRole,
  sectionOrder: ["digital-products", "digital-experiences"],
});
const slugOf = (element: Element) => element.getAttribute("data-work-entry");
const rowOf = (container: HTMLElement, slug: string) =>
  container.querySelector<HTMLElement>(`[data-work-entry="${slug}"]`)!;
const hover = (row: HTMLElement) =>
  fireEvent.pointerOver(row.querySelector("h3 a")!, { pointerType: "mouse" });
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

it("ships every row as a link in the server HTML, under the two areas", () => {
  const html = renderToStaticMarkup(<WorkIndex rows={rows} />);
  for (const row of rows) expect(html).toContain(row.href);
  // The parts of an ecosystem are links too: every project is reachable.
  for (const entry of entries) expect(html).toContain(entry.href);
  expect(html.match(/data-work-entry=/g)).toHaveLength(rows.length);
  expect(html.match(/index-collection-break/g)).toHaveLength(2);
  expect(html).toContain("SaaS &amp; Dashboards");
  expect(html).toContain("Websites &amp; E-commerce");
});

it("shows an ecosystem as one row, its parts linked inside it", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  const toolswift = rowOf(container, "toolswift-customer-dashboard");
  expect(toolswift.querySelector("h3")?.textContent).toBe("ToolSwift");
  expect([...toolswift.querySelectorAll(".index-parts a")].map((link) => link.textContent)).toEqual(
    ["Customer dashboard", "Admin platform", "Marketing site"],
  );
  // The other ToolSwift projects have no row of their own.
  expect(container.querySelector('[data-work-entry="toolswift-admin-platform"]')).toBeNull();
});

it("shows the start year, role, stack and type of work, and no place of work", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  const wajihni = rowOf(container, "wajihni");
  expect(wajihni.textContent).toContain("2024");
  expect(wajihni.textContent).not.toMatch(/present|–/);
  expect(wajihni.querySelector("small")?.textContent).toBe("Full-stack developer");
  expect(wajihni.querySelector(".status")?.textContent).toBe("Completed");
  expect(
    rowOf(container, "toolswift-customer-dashboard").querySelector(".status")?.textContent,
  ).toBe("In progress");
  // The middle column is the kind of work from our categories, not tools.
  expect(
    [...wajihni.querySelectorAll(".index-disciplines li")].map((item) => item.textContent),
  ).toEqual(["SaaS products"]);
  expect(rowOf(container, "smooth-erp").querySelector(".status")?.textContent).toBe("Completed");
  expect(rowOf(container, "falcons-gt-motors").querySelector(".status")?.textContent).toBe(
    "Completed",
  );
  expect(container.textContent).not.toMatch(/webelocity|fivem|freelanc/i);
});

it("filters by area in order, announces counts and supports arrow navigation", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  const visible = () =>
    [...container.querySelectorAll<HTMLElement>("[data-work-entry]:not([hidden])")].map(slugOf);
  expect(visible()).toEqual(rows.map((row) => row.slug));
  expect(screen.getByRole("status").textContent).toBe(`Showing ${rows.length} of ${rows.length}`);
  const saas = screen.getByRole("button", { name: "SaaS & Dashboards" });
  saas.focus();
  fireEvent.click(saas);
  expect(saas.getAttribute("aria-pressed")).toBe("true");
  expect(document.activeElement).toBe(saas);
  expect(visible()).toEqual(
    rows.filter((row) => row.section === "digital-products").map((row) => row.slug),
  );
  // Only the area that still has a row keeps its heading, and the address keeps the filter.
  expect(container.querySelectorAll(".index-collection-break")).toHaveLength(1);
  expect(window.location.search).toBe("?filter=saas-dashboards");
  fireEvent.keyDown(saas, { key: "Home" });
  expect(document.activeElement).toBe(screen.getAllByRole("button")[0]);
  fireEvent.click(screen.getByRole("button", { name: "All" }));
  expect(window.location.search).toBe("");
  expect(container.querySelectorAll(".index-collection-break")).toHaveLength(2);
});

it("shows an explicit empty message", () => {
  render(<WorkIndex rows={[]} />);
  expect(screen.getByText("No projects in this category yet.")).toBeTruthy();
});

it("brings a row's world in once the pointer has stayed, and lets it go after it leaves", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  const shell = container.querySelector(".index-shell")!;
  const row = rowOf(container, "aligna");
  hover(row);
  // At once the row only takes its hover colour: its world is not there yet.
  expect(row.hasAttribute("data-intent")).toBe(true);
  expect(container.querySelector(".index-world-scene")).toBeNull();
  wait(hoverTiming.commit.pointer);
  expect(row.hasAttribute("data-active")).toBe(true);
  expect(shell.hasAttribute("data-world-active")).toBe(true);
  expect(container.querySelector(".work-index")!.hasAttribute("data-engaged")).toBe(true);
  expect(
    container.querySelector('.index-world-scene[data-world="aligna"].is-current'),
  ).toBeTruthy();
  expect(container.querySelector(".index-world-register")?.textContent).toContain("Aligna");
  // Only the hovered row's captures are ever mounted.
  expect(container.querySelectorAll(".index-world-scene")).toHaveLength(1);

  fireEvent.pointerLeave(container.querySelector(".work-index")!);
  wait(hoverTiming.hide);
  expect(row.hasAttribute("data-active")).toBe(false);
  expect(shell.hasAttribute("data-world-active")).toBe(false);
  wait(hoverTiming.reset);
  expect(container.querySelector(".index-world-scene")).toBeNull();
});

it("keeps the last world under the next one while it leaves, then removes it", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  hover(rowOf(container, "aligna"));
  wait(hoverTiming.commit.pointer);
  hover(rowOf(container, "wajihni"));
  wait(hoverTiming.commit.rapid);
  expect(
    container.querySelector('.index-world-scene[data-world="wajihni"].is-current'),
  ).toBeTruthy();
  expect(
    container.querySelector('.index-world-scene[data-world="aligna"].is-previous'),
  ).toBeTruthy();
  wait(hoverTiming.previous.normal);
  expect(container.querySelector(".is-previous")).toBeNull();
});

it("does nothing for a pointer passing through, a touch, or a screen too small for worlds", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  const row = rowOf(container, "aligna");
  hover(row);
  fireEvent.pointerLeave(container.querySelector(".work-index")!);
  wait(hoverTiming.commit.pointer - 1);
  expect(container.querySelector(".index-world-scene")).toBeNull();

  fireEvent.pointerOver(row.querySelector("h3 a")!, { pointerType: "touch" });
  wait(500);
  expect(container.querySelector(".index-world-scene")).toBeNull();

  cleanup();
  stubScreen(false);
  const small = render(<WorkIndex rows={rows} />);
  hover(rowOf(small.container, "aligna"));
  wait(500);
  expect(small.container.querySelector(".index-world-scene")).toBeNull();
});

it("gives the keyboard the same world at once, without the pointer's drift", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  fireEvent.focus(rowOf(container, "smooth-erp").querySelector("h3 a")!);
  wait(0);
  expect(container.querySelector('.index-world-scene[data-world="smooth-erp"]')).toBeTruthy();
  expect(container.querySelector(".work-index-world")?.getAttribute("data-input")).toBe("keyboard");
});

it("drops the world when a filter is chosen", () => {
  const { container } = render(<WorkIndex rows={rows} />);
  hover(rowOf(container, "aligna"));
  wait(hoverTiming.commit.pointer);
  expect(container.querySelector(".index-world-scene")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Websites & E-commerce" }));
  expect(container.querySelector(".index-world-scene")).toBeNull();
  expect(container.querySelector(".work-index")!.hasAttribute("data-engaged")).toBe(false);
});

it("fetches each row's first capture in the background once idle, only on a screen with worlds", () => {
  const sources: string[] = [];
  vi.stubGlobal(
    "Image",
    class {
      decoding = "";
      set src(value: string) {
        sources.push(value);
      }
    },
  );
  render(<WorkIndex rows={rows} />);
  wait(900 + 120 * rows.length);
  expect(sources).toEqual(rows.map((row) => row.proofs[0].src));

  cleanup();
  sources.length = 0;
  stubScreen(false);
  render(<WorkIndex rows={rows} />);
  wait(5000);
  expect(sources).toEqual([]);
});
