import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { sampleAbout } from "@/content/site/review-samples";
import { AboutView } from "./about-view";

afterEach(cleanup);

describe("AboutView", () => {
  it("shows one h2, the introduction, and the three sections when everything is supplied", () => {
    render(<AboutView content={sampleAbout} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("About");
    for (const paragraph of sampleAbout.introduction) {
      expect(screen.getByText(paragraph)).toBeTruthy();
    }
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Areas of work",
      "Approach",
      "Background",
    ]);
    expect(screen.getByText(sampleAbout.approach[0])).toBeTruthy();
    expect(screen.getByText(sampleAbout.background[0])).toBeTruthy();
  });

  it("omits Approach and Background entirely when they have no paragraphs", () => {
    render(
      <AboutView
        content={{ introduction: [sampleAbout.introduction[0]], approach: [], background: [] }}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Areas of work",
    ]);
    expect(screen.queryByText("Approach")).toBeNull();
    expect(screen.queryByText("Background")).toBeNull();
  });

  it("links to both work areas and to Contact", () => {
    render(<AboutView content={sampleAbout} />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/work", "/work", "/#contact"]);
  });

  it("renders no empty paragraphs", () => {
    const { container } = render(<AboutView content={sampleAbout} />);
    for (const paragraph of container.querySelectorAll("p")) {
      expect((paragraph.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});
