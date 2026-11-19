// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/health", () => {
  it("is healthy when the contact form can deliver by email or to the dashboard", async () => {
    vi.stubEnv("RESEND_API_KEY", "key");
    vi.stubEnv("DASHBOARD_INGEST_URL", "");
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, contact: { email: true, dashboard: false } });
  });

  it("reports a form with no way to deliver, without revealing any setting", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("DASHBOARD_INGEST_URL", "");
    const response = GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({ ok: false, contact: { email: false, dashboard: false } });
    expect(JSON.stringify(body)).not.toContain("key");
  });
});
