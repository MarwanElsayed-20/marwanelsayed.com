import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

afterEach(cleanup);

const error = Object.assign(new Error("secret internal detail"), { digest: "abc123" });

describe("ErrorPage", () => {
  it("shows a plain message, a retry button and a way home, with no technical detail", () => {
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Something went wrong");
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to home" }).getAttribute("href")).toBe("/");
    expect(document.body.textContent ?? "").not.toContain("secret internal detail");
    expect(document.body.textContent ?? "").not.toContain("abc123");
  });

  it("retries with reset", () => {
    const reset = vi.fn();
    render(<ErrorPage error={error} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("prefers the newer retry function when Next.js provides it", () => {
    const reset = vi.fn();
    const retry = vi.fn();
    render(<ErrorPage error={error} reset={reset} unstable_retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
  });

  it("prefers the current retry prop over both legacy functions", () => {
    const reset = vi.fn();
    const legacy = vi.fn();
    const retry = vi.fn();
    render(<ErrorPage error={error} reset={reset} unstable_retry={legacy} retry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(legacy).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
  });
});
