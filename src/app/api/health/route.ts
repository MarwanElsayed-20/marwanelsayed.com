import { ingestConfig } from "@/lib/contact/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A status check for the owner's daily monitor: whether the contact form has a way to deliver
 * (the email or the dashboard). It sends nothing and reveals no settings, only yes or no.
 */
export function GET() {
  const email = Boolean(process.env.RESEND_API_KEY?.trim());
  const dashboard = ingestConfig(process.env) !== null;
  const ok = email || dashboard;
  return Response.json(
    { ok, contact: { email, dashboard } },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
