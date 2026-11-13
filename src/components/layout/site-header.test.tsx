import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { SiteHeader } from "./site-header";

afterEach(cleanup);

describe("SiteHeader", () => {
  it("renders a banner landmark with a link to the home page", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeTruthy();
    const link = screen.getByRole("link", { name: site.name });
    expect(link.getAttribute("href")).toBe("/");
  });

  it("offers Get in touch and the menu button", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /Get in touch/ }).getAttribute("href")).toBe(
      "/#contact",
    );
    expect(screen.getByRole("button", { name: "Menu" })).toBeTruthy();
  });
});
