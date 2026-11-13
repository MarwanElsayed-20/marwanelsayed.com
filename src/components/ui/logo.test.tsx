import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { site } from "@/config/site";
import { monogramPaths } from "@/lib/brand/monogram";
import { Logo } from "./logo";

afterEach(cleanup);

it("can be decorative: hidden from assistive technology and unnamed", () => {
  const { container } = render(<Logo decorative />);
  const svg = container.querySelector("svg")!;
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.hasAttribute("aria-label")).toBe(false);
});

it("draws the monogram's own paths in the text colour and is named for the owner", () => {
  const { container } = render(<Logo className="h-8" />);
  const svg = screen.getByRole("img", { name: site.name });
  expect(svg.getAttribute("fill")).toBe("currentColor");
  expect(svg.getAttribute("class")).toBe("h-8");
  expect(container.querySelector("path")?.getAttribute("d")).toBe(monogramPaths("master").mark);
  expect(svg.getAttribute("viewBox")).toMatch(/^0 0 120 112$/);
});
