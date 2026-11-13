import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button, ButtonLink } from "./button";
import { Link } from "./link";

afterEach(cleanup);

describe("Link", () => {
  it("renders an internal link without target or rel", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link.getAttribute("href")).toBe("/about");
    expect(link.getAttribute("target")).toBeNull();
  });

  it("opens external links in a new tab safely and announces it", () => {
    render(<Link href="https://example.com">Example</Link>);
    const link = screen.getByRole("link", { name: /Example/ });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.textContent).toContain("(opens in a new tab)");
  });

  it("uses the inline variant by default and supports standalone", () => {
    render(
      <>
        <Link href="/a">A</Link>
        <Link href="/b" variant="standalone">
          B
        </Link>
      </>,
    );
    expect(screen.getByRole("link", { name: "A" }).className).toContain("underline");
    expect(screen.getByRole("link", { name: "B" }).className).not.toContain("underline");
    expect(screen.getByRole("link", { name: "B" }).className).toContain("lime-sweep");
  });
});

describe("Button", () => {
  it("defaults to type button and the primary variant", () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("bg-accent");
  });

  it("supports the secondary and quiet variants", () => {
    render(
      <>
        <Button variant="secondary">Two</Button>
        <Button variant="quiet">Three</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Two" }).className).toContain("border-border-strong");
    expect(screen.getByRole("button", { name: "Three" }).className).toContain("text-foreground");
  });

  it("is really disabled when asked", () => {
    render(<Button disabled>Off</Button>);
    expect((screen.getByRole("button", { name: "Off" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("keeps a 44px minimum target", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("min-h-11");
  });
});

describe("ButtonLink", () => {
  it("renders a link styled as a button", () => {
    render(<ButtonLink href="/x">Go</ButtonLink>);
    const link = screen.getByRole("link", { name: "Go" });
    expect(link.getAttribute("href")).toBe("/x");
    expect(link.className).toContain("min-h-11");
  });
});

describe("Link accessible names", () => {
  it("forwards a supplied name to an internal link", () => {
    render(
      <Link href="/x" aria-label="Project, Category">
        Project
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Project, Category" })).toBeTruthy();
  });
  it("keeps the new-tab announcement with an external supplied name", () => {
    render(
      <Link href="https://example.com/" aria-label="Open example">
        Open
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Open example (opens in a new tab)" })).toBeTruthy();
  });
});
