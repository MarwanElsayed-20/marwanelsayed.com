import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FooterClock, timeIn } from "./footer-clock";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("tells the time in Cairo, not the visitor's", () => {
  // 08:30 UTC is 10:30 in Cairo in winter (UTC+2) and 11:30 in summer (UTC+3).
  expect(timeIn("Africa/Cairo", new Date("2026-01-15T08:30:00Z"))).toBe("10:30");
  expect(timeIn("Africa/Cairo", new Date("2026-07-15T08:30:00Z"))).toBe("11:30");
  expect(timeIn("Africa/Cairo", new Date("2026-01-15T22:05:00Z"))).toBe("00:05");
});

it("shows a dash on the server, then the time, and follows the clock", () => {
  vi.setSystemTime(new Date("2026-01-15T08:30:00Z"));
  const { container } = render(<FooterClock timeZone="Africa/Cairo" />);
  act(() => void vi.advanceTimersByTime(0));
  expect(container.querySelector("time")?.textContent).toBe("10:30");
  act(() => void vi.advanceTimersByTime(30 * 60_000));
  expect(container.querySelector("time")?.textContent).toBe("11:00");
});
