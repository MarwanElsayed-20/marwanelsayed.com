import type { VisitKind } from "@/lib/track/event";
import type { DeliveryResult } from "./send";

/** A delivery outcome worth telling the owner about, or null when all is well. */
export type DeliveryProblem = {
  kind: Extract<VisitKind, "form_error" | "form_warning">;
  detail: string;
};

const said = (result: DeliveryResult | null) =>
  result === null ? "not set up" : result.ok ? "delivered" : result.reason;

/**
 * Turns the two delivery results (email, dashboard; null when that way is not set up) into what
 * the owner should hear. Losing one copy is a warning; losing the message is an error. An email
 * backup that was never set up is not news on every message (the daily check covers setup).
 */
export function deliveryProblem(
  emailed: DeliveryResult | null,
  ingested: DeliveryResult | null,
): DeliveryProblem | null {
  const emailOk = emailed?.ok === true;
  const dashboardOk = ingested?.ok === true;
  if (!emailOk && !dashboardOk)
    return {
      kind: "form_error",
      detail: `A message was not delivered: email ${said(emailed)}, dashboard ${said(ingested)}`,
    };
  if (emailed && !emailed.ok)
    return {
      kind: "form_warning",
      detail: `The message reached the dashboard, but the email backup failed (${emailed.reason})`,
    };
  if (ingested && !ingested.ok)
    return {
      kind: "form_warning",
      detail: `The message arrived by email, but the dashboard copy failed (${ingested.reason})`,
    };
  return null;
}
