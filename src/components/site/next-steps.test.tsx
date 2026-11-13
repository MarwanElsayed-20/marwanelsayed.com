import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NextSteps } from "./next-steps";

afterEach(cleanup);

describe("NextSteps", () => {
  it("is a labelled region with Contact and More work, and no heading", () => {
    render(<NextSteps />);
    const region = screen.getByRole("region", { name: "Next steps" });
    const links = within(region).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/#contact", "/work"]);
    expect(links.map((link) => link.textContent)).toEqual(["Contact", "More work"]);
    expect(within(region).queryAllByRole("heading")).toHaveLength(0);
  });
});
