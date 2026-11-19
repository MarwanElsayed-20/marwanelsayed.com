import { ingestConfig } from "@/lib/contact/ingest";
import { createRateLimiter } from "@/lib/contact/rate-limit";
import {
  SERVER_ONLY_KINDS,
  browserLabel,
  countryCode,
  isBot,
  parseVisitSignal,
} from "@/lib/track/event";
import { forwardVisit } from "@/lib/track/forward";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 1_000;
// Page views make a busy visit send a few dozen signals; this only stops floods.
const allow = createRateLimiter(120, 10 * 60 * 1000);

/** Always the same empty answer, so the endpoint reveals nothing about what it did. */
const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * The browser reports a page view, a CV download, a case study opened, a contact form that could
 * not reach the site, or a page error; this forwards it to the owner's dashboard with the
 * visitor's country (and, for page errors, the browser). Without the dashboard configured it does
 * nothing.
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
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) return done();
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
  if (!signal || SERVER_ONLY_KINDS.includes(signal.kind)) return done();

  const caller =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!allow(caller)) return done();

  const detail =
    signal.kind === "client_error"
      ? `${signal.detail} · ${browserLabel(userAgent)}`
      : signal.detail;
  await forwardVisit(dashboard, {
    ...signal,
    detail: detail.slice(0, 200),
    country: countryCode(request.headers.get("x-vercel-ip-country")),
  });
  return done();
}
