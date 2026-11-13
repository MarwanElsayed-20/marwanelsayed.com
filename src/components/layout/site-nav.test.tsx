import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { menuStore } from "@/lib/menu-state";
import { MenuOverlay } from "./menu-overlay";
import { SiteNav } from "./site-nav";

const state = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));

const items = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
];
const projects = [{ title: "Alpha", href: "/websites-ecommerce/alpha" }];

function Menu(props: { profiles?: { label: string; url: string }[]; whatsapp?: string | null }) {
  return (
    <>
      <div data-page-shell />
      <SiteNav />
      <MenuOverlay items={items} projects={projects} {...props} />
    </>
  );
}

afterEach(() => {
  cleanup();
  act(() => menuStore.set(null));
  state.pathname = "/";
});

describe("header pills", () => {
  it("offers Get in touch and a Menu button that is closed by default", () => {
    render(<SiteNav />);
    expect(screen.getByRole("link", { name: /Get in touch/ }).getAttribute("href")).toBe(
      "/#contact",
    );
    expect(screen.getByRole("button", { name: "Menu" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });
});

describe("full-screen menu", () => {
  it("renders a primary navigation landmark, selected projects and a close button", () => {
    render(<Menu />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("href")).toBe("/work");
    expect(screen.getByRole("link", { name: "Alpha" }).getAttribute("href")).toBe(
      "/websites-ecommerce/alpha",
    );
    expect(screen.getByRole("button", { name: "Close menu" })).toBeTruthy();
  });

  it("marks a route link as the current page on its exact path", () => {
    state.pathname = "/work";
    render(<Menu />);
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBeNull();
  });

  it("marks nothing on detail pages and Home only on the exact root", () => {
    state.pathname = "/work/item";
    const { unmount } = render(<Menu />);
    expect(screen.getByRole("link", { name: "Work" }).getAttribute("aria-current")).toBeNull();
    unmount();
    state.pathname = "/";
    render(<Menu />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe(
      "location",
    );
  });

  it("opens with the button, exposes the state and closes with the close button", () => {
    render(<Menu />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on Escape from anywhere and returns focus to the button", () => {
    render(<Menu />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("closes when a link to the same page is followed", () => {
    render(<Menu />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes when the route changes", () => {
    const { rerender } = render(<Menu />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    state.pathname = "/work";
    rerender(<Menu />);
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("locks scrolling and makes the page inert only while open, then fully restores", () => {
    render(<Menu />);
    const shell = document.querySelector("[data-page-shell]")!;
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.dataset.menuOpen).toBe("true");
    expect(shell.hasAttribute("inert")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.documentElement.dataset.menuOpen).toBeUndefined();
    expect(shell.hasAttribute("inert")).toBe(false);
  });

  it("releases the lock when unmounted while open", () => {
    const { unmount } = render(<Menu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("shows the profile links when supplied, and no email", () => {
    render(<Menu profiles={[{ label: "GitHub", url: "https://github.com/x" }]} />);
    expect(screen.queryByRole("link", { name: /@/ })).toBeNull();
    expect(screen.getByRole("link", { name: /GitHub/ }).getAttribute("href")).toBe(
      "https://github.com/x",
    );
  });

  it("lists WhatsApp under Follow Us when there is a number", () => {
    render(<Menu whatsapp="201114766628" />);
    const link = screen.getByRole("link", { name: /^WhatsApp/ });
    expect(link.getAttribute("href")).toBe("https://wa.me/201114766628");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("Follow Us")).toBeTruthy();
  });
});
