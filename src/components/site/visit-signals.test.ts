import { describe, expect, it } from "vitest";
import { describeError } from "./visit-signals";

describe("describeError", () => {
  it("keeps the message with its file and line", () => {
    expect(
      describeError(
        "TypeError: x is undefined",
        "https://marwanelsayed.com/_next/static/chunks/abc.js?v=1",
        12,
      ),
    ).toBe("TypeError: x is undefined (abc.js:12)");
    expect(describeError(new Error("boom"))).toBe("Error: boom");
  });

  it("ignores noise the owner cannot act on", () => {
    expect(describeError("Script error.")).toBeNull();
    expect(
      describeError("ResizeObserver loop completed with undelivered notifications."),
    ).toBeNull();
    expect(describeError("x", "chrome-extension://abc/content.js")).toBeNull();
    expect(describeError("")).toBeNull();
  });
});
