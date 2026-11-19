import { describe, expect, it } from "vitest";
import { deliveryProblem } from "./problem";

const ok = { ok: true } as const;
const rejected = { ok: false, reason: "rejected" } as const;
const unreachable = { ok: false, reason: "unreachable" } as const;

describe("deliveryProblem", () => {
  it("is quiet when the message arrived and nothing set up failed", () => {
    expect(deliveryProblem(ok, ok)).toBeNull();
    expect(deliveryProblem(null, ok)).toBeNull();
    expect(deliveryProblem(ok, null)).toBeNull();
  });

  it("warns when one copy was lost", () => {
    expect(deliveryProblem(rejected, ok)).toEqual({
      kind: "form_warning",
      detail: "The message reached the dashboard, but the email backup failed (rejected)",
    });
    expect(deliveryProblem(ok, unreachable)).toEqual({
      kind: "form_warning",
      detail: "The message arrived by email, but the dashboard copy failed (unreachable)",
    });
  });

  it("is an error when the message was lost", () => {
    expect(deliveryProblem(rejected, unreachable)).toEqual({
      kind: "form_error",
      detail: "A message was not delivered: email rejected, dashboard unreachable",
    });
    expect(deliveryProblem(null, rejected)?.detail).toBe(
      "A message was not delivered: email not set up, dashboard rejected",
    );
  });
});
