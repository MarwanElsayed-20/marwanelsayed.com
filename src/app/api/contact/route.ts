import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { buildContactEmail } from "@/lib/contact/email";
import { ingestConfig, sendToDashboard } from "@/lib/contact/ingest";
import { loadEmailPalette } from "@/lib/contact/palette";
import { deliveryProblem } from "@/lib/contact/problem";
import { countryCode } from "@/lib/track/event";
import { forwardVisit } from "@/lib/track/forward";
import { createRateLimiter } from "@/lib/contact/rate-limit";
import { deliver, type DeliveryConfig } from "@/lib/contact/send";
import { validateContact } from "@/lib/contact/validate";
import { TRAP_FIELD } from "@/lib/contact/trap";
import { siteContent } from "@/lib/site-content";
import { siteOrigin } from "@/lib/site/site-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_CHARS = 20_000;
const allow = createRateLimiter(5, 10 * 60 * 1000);

/** The message is delivered only when an API key and a recipient exist. Nothing is ever pretended. */
function deliveryConfig(): DeliveryConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || siteContent.contact.email;
  if (!apiKey || !to) return null;
  return {
    apiKey,
    to,
    from: process.env.CONTACT_FROM_EMAIL?.trim() || `${site.name} <onboarding@resend.dev>`,
    endpoint: process.env.RESEND_API_URL?.trim() || undefined,
  };
}

/** The page the form was sent from, from the Referer header; "/" when it is missing. */
function formPage(referer: string | null): string {
  try {
    const path = referer ? new URL(referer).pathname : "/";
    return path.length <= 200 ? path : "/";
  } catch {
    return "/";
  }
}

const reply = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Browsers send Origin on cross-site posts; a different host is never this site's own form.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host"))
        return reply(403, { error: "forbidden" });
    } catch {
      return reply(403, { error: "forbidden" });
    }
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply(415, { error: "unsupported" });

  const body = await request.text();
  if (body.length > MAX_BODY_CHARS) return reply(413, { error: "too-large" });
  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    raw = parsed as Record<string, unknown>;
  } catch {
    return reply(400, { error: "bad-request" });
  }

  // A real visitor never sees this field. A bot that fills it gets a quiet success and no email.
  const trap = raw[TRAP_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") return reply(200, { ok: true });

  const result = validateContact(raw);
  if (!result.ok) return reply(422, { error: "invalid", errors: result.errors });

  const caller =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!allow(caller)) return reply(429, { error: "rate-limited" });

  // Two independent ways in: the email (the backup) and the owner's dashboard, which stores the
  // message and notifies their phone. Either one arriving is a delivered message.
  const config = deliveryConfig();
  const dashboard = ingestConfig(process.env);
  if (!config && !dashboard) return reply(503, { error: "not-configured" });

  const [emailed, ingested] = await Promise.all([
    config
      ? deliver(config, {
          ...buildContactEmail(result.value, {
            siteName: site.name,
            siteUrl: siteOrigin(process.env),
            receivedAt: new Date(),
            palette: loadEmailPalette(),
          }),
          replyTo: result.value.email,
        })
      : null,
    dashboard ? sendToDashboard(dashboard, result.value) : null,
  ]);
  if (emailed && !emailed.ok) console.error("contact: email delivery failed:", emailed.reason);
  if (ingested && !ingested.ok)
    console.error("contact: dashboard delivery failed:", ingested.reason);
  // Tell the owner when a copy or the whole message was lost. If the dashboard itself is down this
  // may not arrive either; the visitor is always shown the email address in that case.
  const problem = deliveryProblem(emailed, ingested);
  if (problem && dashboard)
    await forwardVisit(dashboard, {
      ...problem,
      path: formPage(request.headers.get("referer")),
      referrer: "",
      country: countryCode(request.headers.get("x-vercel-ip-country")),
    });
  return emailed?.ok || ingested?.ok
    ? reply(200, { ok: true })
    : reply(502, { error: "delivery-failed" });
}
