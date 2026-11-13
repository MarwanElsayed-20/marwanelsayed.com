import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";
import { Section } from "./section";

afterEach(cleanup);

describe("Section", () => {
  it("is a region labelled by its heading", () => {
    render(<Section heading="Topic">body</Section>);
    const region = screen.getByRole("region", { name: "Topic" });
    expect(region.tagName).toBe("SECTION");
    expect(screen.getByRole("heading", { level: 2, name: "Topic" })).toBeTruthy();
  });

  it("renders the intro and supports a level 3 heading", () => {
    render(
      <Section heading="Topic" intro="Short intro" headingLevel={3}>
        body
      </Section>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Topic" })).toBeTruthy();
    expect(screen.getByText("Short intro")).toBeTruthy();
  });

  it("applies the subtle tone", () => {
    render(<Section tone="subtle">body</Section>);
    expect(screen.getByText("body").closest("section")?.className).toContain("bg-surface-subtle");
  });

  it("has no accessible name without a heading", () => {
    render(<Section>body</Section>);
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("PageHeader", () => {
  it("renders the single h1 with eyebrow and intro", () => {
    render(<PageHeader title="Page" eyebrow="Eyebrow" intro="Intro text" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Page" })).toBeTruthy();
    expect(screen.getByText("Eyebrow")).toBeTruthy();
    expect(screen.getByText("Intro text")).toBeTruthy();
  });
});
