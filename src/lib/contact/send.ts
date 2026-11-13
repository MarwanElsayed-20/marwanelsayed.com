export type DeliveryConfig = {
  apiKey: string;
  from: string;
  to: string;
  /** Overrides the delivery endpoint; used by the end-to-end test server. */
  endpoint?: string;
};

export type DeliveryMessage = {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
};

export type DeliveryResult = { ok: true } | { ok: false; reason: "rejected" | "unreachable" };

export const DEFAULT_ENDPOINT = "https://api.resend.com/emails";

/** Sends one email through Resend's HTTP API. Never throws; reports a coarse reason instead. */
export async function deliver(
  config: DeliveryConfig,
  message: DeliveryMessage,
  fetchImpl: typeof fetch = fetch,
): Promise<DeliveryResult> {
  try {
    const response = await fetchImpl(config.endpoint ?? DEFAULT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
