import type { ContactInput } from "./validate";
import type { DeliveryResult } from "./send";

/** Where the owner's dashboard receives messages, and the key it expects. */
export type IngestConfig = { url: string; secret: string };

/**
 * The dashboard is reached only when both DASHBOARD_INGEST_URL (https, or http on localhost for
 * tests) and DASHBOARD_INGEST_SECRET are set; otherwise the form keeps working through email alone.
 */
export function ingestConfig(env: Record<string, string | undefined>): IngestConfig | null {
  const url = env.DASHBOARD_INGEST_URL?.trim();
  const secret = env.DASHBOARD_INGEST_SECRET?.trim();
  if (!url || !secret) return null;
  try {
    const parsed = new URL(url);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) return null;
  } catch {
    return null;
  }
  return { url, secret };
}

/**
 * Posts one validated message to the dashboard, which stores it and notifies the owner's phone.
 * Never throws; reports a coarse reason instead, like the email sender.
 */
export async function sendToDashboard(
  config: IngestConfig,
  input: ContactInput,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  try {
    const response = await fetchImpl(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
