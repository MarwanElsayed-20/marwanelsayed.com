import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FocusStatement } from "./focus-statement";

afterEach(cleanup);

describe("FocusStatement", () => {
  it("keeps the statement as one readable paragraph of real words", () => {
    render(<FocusStatement text="I work on SaaS products." />);
    const section = screen.getByRole("region", { name: "What I work on" });
    expect(section.textContent).toBe("I work on SaaS products.");
    expect(section.querySelectorAll("[data-focus-word]")).toHaveLength(5);
  });

  it("adds a centred button to the About page when given an action", () => {
    render(
      <FocusStatement
        text="I work on SaaS products."
        action={{ label: "About me", href: "/about" }}
      />,
    );
    const link = screen.getByRole("link", { name: "About me" });
    expect(link.getAttribute("href")).toBe("/about");
    expect(link.closest("[data-focus-action]")?.className).toContain("justify-center");
  });

  it("shows no button without an action", () => {
    render(<FocusStatement text="I work on SaaS products." />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
