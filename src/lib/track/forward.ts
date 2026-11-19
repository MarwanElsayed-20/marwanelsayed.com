import type { IngestConfig } from "@/lib/contact/ingest";
import { visitEndpoint, type VisitEvent } from "./event";

/**
 * Sends one visit event to the owner's dashboard. Never throws; reports whether it arrived, so a
 * caller can log a failure. Used by /api/track (for the browser) and by the contact route.
 */
export async function forwardVisit(
  config: IngestConfig,
  event: VisitEvent,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImpl(visitEndpoint(config.url), {
      method: "POST",
      headers: { Authorization: `Bearer ${config.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) console.error("track: dashboard rejected the event:", response.status);
    return response.ok;
  } catch {
    console.error("track: dashboard unreachable");
    return false;
  }
}
