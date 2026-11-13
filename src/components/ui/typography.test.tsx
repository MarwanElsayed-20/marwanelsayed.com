import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Heading } from "./heading";
import { Label } from "./label";
import { Text } from "./text";

afterEach(cleanup);

describe("Heading", () => {
  it("renders the semantic level independently of the visual size", () => {
    render(
      <Heading level={2} size="display">
        Title
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Title" });
    expect(heading.tagName).toBe("H2");
    expect(heading.className).toContain("text-display");
  });

  it("defaults the visual size to the level", () => {
    render(<Heading level={3}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 3 }).className).toContain("text-h3");
  });

  it("passes id and className through", () => {
    render(
      <Heading level={1} id="top" className="extra">
        Title
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.id).toBe("top");
    expect(heading.className).toContain("extra");
  });
});

describe("Text", () => {
  it("renders a paragraph by default with the body style", () => {
    render(<Text>hello</Text>);
    const node = screen.getByText("hello");
    expect(node.tagName).toBe("P");
    expect(node.className).toContain("text-body");
  });

  it("supports other elements and variants", () => {
    render(
      <Text as="span" variant="lead">
        hello
      </Text>,
    );
    const node = screen.getByText("hello");
    expect(node.tagName).toBe("SPAN");
    expect(node.className).toContain("text-lead");
  });
});

describe("Label", () => {
  it("renders text with the neutral tone by default and the accent tone on request", () => {
    render(
      <>
        <Label>One</Label>
        <Label tone="accent">Two</Label>
      </>,
    );
    expect(screen.getByText("One").className).toContain("text-muted");
    expect(screen.getByText("Two").className).toContain("text-accent");
  });
});
