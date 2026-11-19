import { ingestConfig } from "@/lib/contact/ingest";
import { createRateLimiter } from "@/lib/contact/rate-limit";
import { countryCode, isBot, parseVisitSignal, visitEndpoint } from "@/lib/track/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 1_000;
// Page views make a busy visit send a few dozen signals; this only stops floods.
const allow = createRateLimiter(120, 10 * 60 * 1000);

/** Always the same empty answer, so the endpoint reveals nothing about what it did. */
const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * The browser reports a page view, a CV download or a case study opened; this forwards it to the owner's
 * dashboard with the visitor's country. Without the dashboard configured it does nothing.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return done();
    } catch {
      return done();
    }
  }
  if (isBot(request.headers.get("user-agent"))) return done();
  const dashboard = ingestConfig(process.env);
  if (!dashboard) return done();

  const body = await request.text();
  if (body.length > MAX_BODY_CHARS) return done();
  let signal;
  try {
    signal = parseVisitSignal(JSON.parse(body));
  } catch {
    return done();
  }
  if (!signal) return done();

  const caller =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!allow(caller)) return done();

  try {
    const response = await fetch(visitEndpoint(dashboard.url), {
      method: "POST",
      headers: { Authorization: `Bearer ${dashboard.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...signal,
        country: countryCode(request.headers.get("x-vercel-ip-country")),
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) console.error("track: dashboard rejected the visit:", response.status);
  } catch {
    console.error("track: dashboard unreachable");
  }
  return done();
}
