import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HashFocus } from "./hash-focus";
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});
it.each(["websites-ecommerce", "saas-dashboards"])(
  "maps legacy %s to Work, preserving its filter",
  async (filter) => {
    window.history.replaceState(null, "", `/#${filter}`);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    vi.stubGlobal("scrollTo", vi.fn());
    const received = vi.fn();
    window.addEventListener("work-filter", received);
    try {
      const { container } = render(
        <>
          <section id="work" tabIndex={-1} />
          <HashFocus />
        </>,
      );
      await waitFor(() => expect(window.location.hash).toBe("#work"));
      const section = container.querySelector<HTMLElement>("#work")!;
      expect(section.dataset.workFilter).toBe(filter);
      expect(document.activeElement).toBe(section);
      expect(received).toHaveBeenCalled();
    } finally {
      window.removeEventListener("work-filter", received);
    }
  },
);

it("waits for the open menu to close before focusing a hash destination", async () => {
  window.history.replaceState(null, "", "/#about");
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  vi.stubGlobal("scrollTo", vi.fn());
  document.documentElement.dataset.menuOpen = "true";
  try {
    const { container } = render(
      <>
        <section id="about" tabIndex={-1} />
        <HashFocus />
      </>,
    );
    const section = container.querySelector<HTMLElement>("#about")!;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).not.toBe(section);
    delete document.documentElement.dataset.menuOpen;
    await waitFor(() => expect(document.activeElement).toBe(section));
  } finally {
    delete document.documentElement.dataset.menuOpen;
  }
});
