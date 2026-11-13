import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card, CardLink } from "./card";
import { Grid } from "./grid";

afterEach(cleanup);

describe("Card", () => {
  it("renders children inside a static surface", () => {
    render(<Card>hello</Card>);
    expect(screen.getByText("hello").className).toContain("bg-surface");
  });
});

describe("CardLink", () => {
  it("renders exactly one link, which is the title", () => {
    render(<CardLink href="/x" title="Project title" description="About it" label="Category" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toBe("Project title");
    expect(links[0].getAttribute("href")).toBe("/x");
  });

  it("uses the requested heading level and shows label and description", () => {
    render(
      <CardLink
        href="/x"
        title="Project title"
        description="About it"
        label="Category"
        headingLevel={2}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Project title");
    expect(screen.getByText("About it")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
  });

  it("works with only a title", () => {
    render(<CardLink href="/x" title="Only title" />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("Grid", () => {
  it("renders 1, 2, then 3 columns by default", () => {
    render(<Grid>content</Grid>);
    const cls = screen.getByText("content").className;
    expect(cls).toContain("grid-cols-1");
    expect(cls).toContain("md:grid-cols-2");
    expect(cls).toContain("lg:grid-cols-3");
  });

  it("caps at 2 columns when asked", () => {
    render(<Grid columns={2}>content</Grid>);
    expect(screen.getByText("content").className).not.toContain("lg:grid-cols-3");
  });

  it("can render a list", () => {
    render(
      <Grid as="ul">
        <li>one</li>
      </Grid>,
    );
    expect(screen.getByRole("list")).toBeTruthy();
  });
});

describe("CardLink media and context", () => {
  it("renders media above the title without adding a link", () => {
    render(<CardLink href="/x" title="With media" media={<div data-testid="media">m</div>} />);
    expect(screen.getByTestId("media")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("adds hidden context to the link name only", () => {
    render(<CardLink href="/x" title="Project title" hiddenContext="Category" />);
    const link = screen.getByRole("link");
    expect(link.textContent).toBe("Project title, Category");
    expect(screen.getByRole("heading").textContent).toBe("Project title, Category");
    expect(link.querySelector(".sr-only")?.textContent).toBe(", Category");
  });
});
