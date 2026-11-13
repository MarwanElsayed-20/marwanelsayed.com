import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { navItems } from "@/config/navigation";
import { MenuOverlay } from "./menu-overlay";

const state = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));

afterEach(() => {
  cleanup();
  state.pathname = "/";
});

const current = () =>
  screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current"))
    .map((link) => link.textContent?.replace(/^\d+/, ""));

describe("navigation with home sections", () => {
  it("lists all four destinations in navigation order", () => {
    expect(navItems.map((item) => item.label)).toEqual(["Home", "Work", "Services", "About"]);
  });

  it("marks a route link as the current page only on its exact path", () => {
    const routes = [
      { label: "Home", href: "/" },
      { label: "Work", href: "/work" },
      { label: "Services", href: "/services", parent: true },
      { label: "About", href: "/about" },
    ];
    for (const [path, expected] of [
      ["/work", ["Work"]],
      ["/services", ["Services"]],
      ["/services/dashboards", ["Services"]],
      ["/servicesx", []],
      ["/about", ["About"]],
      ["/contact", []],
      ["/work/anything", []],
    ] as const) {
      state.pathname = path;
      render(<MenuOverlay items={routes} projects={[]} />);
      expect(current(), path).toEqual(expected);
      cleanup();
    }
  });

  it("marks no section on product detail or redirected root paths", () => {
    for (const path of ["/saas-dashboards", "/saas-dashboards/a-product"]) {
      state.pathname = path;
      render(<MenuOverlay items={navItems} projects={[]} />);
      expect(current(), path).toEqual([]);
      cleanup();
    }
  });

  it("marks no section on experience detail or redirected root paths", () => {
    for (const path of ["/websites-ecommerce", "/websites-ecommerce/a-project"]) {
      state.pathname = path;
      render(<MenuOverlay items={navItems} projects={[]} />);
      expect(current(), path).toEqual([]);
      cleanup();
    }
  });
});

it("tracks section positions and cleans up the observer", () => {
  let callback: IntersectionObserverCallback = () => {};
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const section = document.createElement("section");
  section.id = "contact";
  section.getBoundingClientRect = () => ({ top: 12 }) as DOMRect;
  document.body.append(section);
  try {
    const withSection = [...navItems, { label: "Contact", href: "/#contact" }];
    const { unmount } = render(<MenuOverlay items={withSection} projects={[]} />);
    expect(observe).toHaveBeenCalledWith(section);
    expect(screen.getByRole("link", { name: /Contact/ }).getAttribute("aria-current")).toBe(
      "location",
    );
    callback([], {} as IntersectionObserver);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  } finally {
    section.remove();
    vi.unstubAllGlobals();
  }
});
