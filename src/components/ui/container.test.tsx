import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Container } from "./container";

afterEach(cleanup);

describe("Container", () => {
  it("renders its children", () => {
    render(<Container>hello</Container>);
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("merges a custom className with the base classes", () => {
    render(<Container className="extra">hello</Container>);
    const element = screen.getByText("hello");
    expect(element.className).toContain("mx-auto");
    expect(element.className).toContain("extra");
  });

  it("uses the page width by default", () => {
    render(<Container>hello</Container>);
    expect(screen.getByText("hello").className).toContain("max-w-page");
  });

  it("supports the reading and wide widths", () => {
    render(
      <>
        <Container width="reading">reading</Container>
        <Container width="wide">wide</Container>
      </>,
    );
    expect(screen.getByText("reading").className).toContain("max-w-reading");
    expect(screen.getByText("wide").className).toContain("max-w-wide");
  });
});
