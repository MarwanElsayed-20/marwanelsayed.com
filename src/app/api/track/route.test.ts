// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const fetchMock = vi.fn();
const human = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1";
let ip = 0;
const post = (payload: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://site.test/api/track", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "site.test",
        "user-agent": human,
        "x-forwarded-for": `10.1.0.${++ip}`,
        ...headers,
      },
      body: JSON.stringify(payload),
    }),
  );

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("DASHBOARD_INGEST_URL", "https://dash.example.com/api/ingest");
  vi.stubEnv("DASHBOARD_INGEST_SECRET", "s3cret");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/track", () => {
  it("forwards a CV download with the visitor's country to the dashboard", async () => {
    const response = await post(
      { kind: "cv_download", path: "/", referrer: "https://www.linkedin.com/feed/" },
      { "x-vercel-ip-country": "QA" },
    );
    expect(response.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://dash.example.com/api/ingest/events");
    expect(init.headers.Authorization).toBe("Bearer s3cret");
    expect(JSON.parse(init.body)).toEqual({
      kind: "cv_download",
      path: "/",
      referrer: "linkedin.com",
      country: "QA",
    });
  });

  it("ignores bots, other sites, bad signals and an unconfigured dashboard", async () => {
    await post({ kind: "cv_download", path: "/" }, { "user-agent": "Googlebot/2.1" });
    await post({ kind: "cv_download", path: "/" }, { origin: "https://evil.test" });
    await post({ kind: "nope", path: "/" });
    vi.stubEnv("DASHBOARD_INGEST_URL", "");
    const response = await post({ kind: "cv_download", path: "/" });
    expect(response.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers the same way when the dashboard is down", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await post({ kind: "case_study", path: "/saas-dashboards/aligna" });
    expect(response.status).toBe(204);
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});
