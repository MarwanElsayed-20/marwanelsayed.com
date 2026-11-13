import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { destinationLinks, NotSupplied } from "./not-supplied";

afterEach(cleanup);

describe("destinationLinks", () => {
  it("omits the current page and keeps navigation order", () => {
    expect(destinationLinks("/about").map((link) => link.href)).toEqual(["/work", "/#contact"]);
    expect(destinationLinks("/#contact").map((link) => link.href)).toEqual(["/work", "/about"]);
  });
});

describe("NotSupplied", () => {
  it("shows one h2, the message, and links onward", () => {
    render(
      <NotSupplied
        title="About"
        message="This page is being prepared."
        links={destinationLinks("/about")}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("About");
    expect(screen.getByText("This page is being prepared.")).toBeTruthy();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/work",
      "/#contact",
    ]);
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });
});
