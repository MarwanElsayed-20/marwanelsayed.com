import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

afterEach(cleanup);

describe("SiteFooter", () => {
  it("renders a contentinfo landmark with the four destinations and no placeholder text", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((l) => l.getAttribute("href")),
    ).toEqual(["/", "/work", "/services", "/about"]);
    expect(screen.getByRole("contentinfo").textContent ?? "").not.toMatch(/placeholder/i);
  });

  it("shows no contact details when none are supplied", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    expect(screen.queryByRole("link", { name: /@/ })).toBeNull();
    // The four destinations and the link to the site's source code.
    expect(screen.getByRole("contentinfo").querySelectorAll("a")).toHaveLength(5);
  });

  it("shows only the supplied email and profile links", () => {
    render(
      <SiteFooter
        contact={{
          email: "name@studio.invalid",
          profiles: [{ label: "Profile", url: "https://profile.invalid/name" }],
        }}
      />,
    );
    const email = screen.getByRole("link", { name: "name@studio.invalid" });
    expect(email.getAttribute("href")).toBe("mailto:name@studio.invalid");
    const profile = screen.getByRole("link", { name: /Profile/ });
    expect(profile.getAttribute("target")).toBe("_blank");
    expect(profile.getAttribute("rel")).toContain("noopener");
  });

  it("has a round back-to-top button named for assistive technology, and the name as decoration", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    expect(screen.getByRole("button", { name: "Back to top" })).toBeTruthy();
    const name = screen.getByRole("contentinfo").querySelector("[data-footer-name]");
    expect(name?.getAttribute("aria-hidden")).toBe("true");
  });

  it("says where the owner is, the time there and the copyright, in that order", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toContain("Based in Cairo, Egypt");
    expect(footer.textContent).toMatch(/Current time: /);
    expect(footer.textContent).toContain(`© ${new Date().getFullYear()}`);
    expect(footer.textContent ?? "").not.toMatch(/availab/i);
  });

  it("links the site's public source code beside the copyright, in a new tab", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    const source = screen.getByRole("link", { name: /Source code/ });
    expect(source.getAttribute("href")).toBe(
      "https://github.com/MarwanElsayed-20/marwanelsayed.com",
    );
    expect(source.getAttribute("target")).toBe("_blank");
    expect(source.parentElement?.textContent).toMatch(/^© \d{4} .+ · Source code/);
  });

  it("puts a wave under the email and hides it from assistive technology", () => {
    render(<SiteFooter contact={{ email: "name@studio.invalid", profiles: [] }} />);
    const email = screen.getByRole("link", { name: "name@studio.invalid" });
    const wave = email.querySelector("[data-footer-wave]");
    expect(wave?.getAttribute("aria-hidden")).toBe("true");
  });

  it("spreads the place, time and copyright across one full-width row", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    const place = screen.getByText(/^Based in /);
    const row = place.parentElement!;
    expect(row.className).toContain("sm:justify-between");
    expect([...row.children].map((child) => child.textContent ?? "")).toEqual([
      expect.stringMatching(/^Based in Cairo, Egypt$/),
      expect.stringMatching(/^Current time: /),
      expect.stringMatching(/^© \d{4} /),
    ]);
  });

  it("sets the back-to-top button in its own row above the name, at the right-hand end", () => {
    render(<SiteFooter contact={{ email: null, profiles: [] }} />);
    const button = screen.getByRole("button", { name: "Back to top" });
    const row = button.parentElement!;
    expect(row.className).toContain("justify-end");
    expect(row.nextElementSibling?.hasAttribute("data-footer-name")).toBe(true);
    expect(button.closest(".absolute")).toBeNull();
  });

  it("lists WhatsApp with the profiles, as a chat link and never a phone link", () => {
    render(<SiteFooter contact={{ email: null, profiles: [], whatsapp: "201114766628" }} />);
    const link = screen.getByRole("link", { name: /^WhatsApp/ });
    expect(link.getAttribute("href")).toBe("https://wa.me/201114766628");
    expect(screen.getByText("Follow me")).toBeTruthy();
    expect(screen.getByRole("contentinfo").querySelector("a[href^='tel:']")).toBeNull();
  });
});
