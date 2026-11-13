// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/contact/send", () => ({ deliver: send }));
const ingest = vi.hoisted(() => vi.fn());
vi.mock("@/lib/contact/ingest", async (original) => ({
  ...(await original<typeof import("@/lib/contact/ingest")>()),
  sendToDashboard: ingest,
}));

import { POST } from "./route";

const body = {
  topic: "other",
  name: "Sam",
  email: "sam@studio.co",
  message: "I would like a storefront.",
  website: "",
};
const post = (payload: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://site.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", host: "site.test", ...headers },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ ok: true });
  ingest.mockReset();
  ingest.mockResolvedValue({ ok: true });
  vi.stubEnv("RESEND_API_KEY", "key");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/contact", () => {
  it("delivers a valid message to the owner and reports success", async () => {
    const response = await post(body, { "x-forwarded-for": "10.0.0.1" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const [config, message] = send.mock.calls[0];
    expect(config.to).toBe("hello@marwanelsayed.com");
    expect(message).toMatchObject({ replyTo: "sam@studio.co", subject: "New message from Sam" });
    expect(message.html).toContain("I would like a storefront.");
  });

  it("says plainly that delivery is not configured instead of pretending", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const response = await post(body, { "x-forwarded-for": "10.0.0.2" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });

  it("reports a failed delivery as an error, never as success", async () => {
    send.mockResolvedValue({ ok: false, reason: "rejected" });
    const response = await post(body, { "x-forwarded-for": "10.0.0.3" });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "delivery-failed" });
  });

  it("returns field errors for invalid input without sending", async () => {
    const response = await post({ ...body, email: "nope" }, { "x-forwarded-for": "10.0.0.4" });
    expect(response.status).toBe(422);
    expect((await response.json()).errors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("quietly accepts but never sends when the hidden field is filled", async () => {
    const response = await post({ ...body, fax: "555-0100" }, { "x-forwarded-for": "10.0.0.5" });
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects another origin, other content types, bad JSON and oversized bodies", async () => {
    expect((await post(body, { origin: "http://evil.test" })).status).toBe(403);
    expect((await post(body, { "content-type": "text/plain" })).status).toBe(415);
    expect((await post("{not json")).status).toBe(400);
    expect((await post({ ...body, message: "x".repeat(30_000) })).status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it("limits how often one caller can send", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1)
      statuses.push((await post(body, { "x-forwarded-for": "10.9.9.9" })).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429]);
  });

  describe("with the dashboard connected", () => {
    beforeEach(() => {
      vi.stubEnv("DASHBOARD_INGEST_URL", "https://dash.test/api/ingest");
      vi.stubEnv("DASHBOARD_INGEST_SECRET", "ingest-key");
    });

    it("sends the validated message to the dashboard as well as by email", async () => {
      const response = await post(
        { ...body, topic: "job", company: "Acme", budget: "3k-10k" },
        { "x-forwarded-for": "10.1.0.1" },
      );
      expect(response.status).toBe(200);
      expect(send).toHaveBeenCalledTimes(1);
      const [config, message] = ingest.mock.calls[0];
      expect(config).toEqual({ url: "https://dash.test/api/ingest", secret: "ingest-key" });
      expect(message).toMatchObject({
        topic: "job",
        company: "Acme",
        budget: "",
        email: "sam@studio.co",
      });
    });

    it("counts the message delivered when only one of the two arrives", async () => {
      send.mockResolvedValue({ ok: false, reason: "rejected" });
      expect((await post(body, { "x-forwarded-for": "10.1.0.2" })).status).toBe(200);
      send.mockResolvedValue({ ok: true });
      ingest.mockResolvedValue({ ok: false, reason: "unreachable" });
      expect((await post(body, { "x-forwarded-for": "10.1.0.3" })).status).toBe(200);
    });

    it("reports failure only when both fail", async () => {
      send.mockResolvedValue({ ok: false, reason: "rejected" });
      ingest.mockResolvedValue({ ok: false, reason: "unreachable" });
      expect((await post(body, { "x-forwarded-for": "10.1.0.4" })).status).toBe(502);
    });

    it("works through the dashboard alone when email is not set up", async () => {
      vi.stubEnv("RESEND_API_KEY", "");
      expect((await post(body, { "x-forwarded-for": "10.1.0.5" })).status).toBe(200);
      expect(send).not.toHaveBeenCalled();
      expect(ingest).toHaveBeenCalledTimes(1);
    });
  });
});
