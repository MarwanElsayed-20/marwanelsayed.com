import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroFallback } from "./hero-fallback";

afterEach(cleanup);

const icon = (name: string) => ({
  name,
  viewBox: "0 0 24 24",
  markup: '<path fill="@61dafb" d="M0 0h1v1z"/>',
});

describe("HeroFallback", () => {
  it("is a decorative svg that draws each logo in its own colour", () => {
    const { container } = render(<HeroFallback icons={[icon("React")]} />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("svg svg path")?.getAttribute("fill")).toBe("#61dafb");
  });

  it("draws one logo per icon, up to two rows of four", () => {
    const icons = Array.from({ length: 14 }, (_, index) => icon(`T${index}`));
    const { container } = render(<HeroFallback icons={icons} />);
    expect(container.querySelectorAll("svg svg")).toHaveLength(8);
  });

  it("still renders an svg when there are no icons", () => {
    const { container } = render(<HeroFallback />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelectorAll("svg svg")).toHaveLength(0);
  });
});
