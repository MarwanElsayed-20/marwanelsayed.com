import {
  CONTACT_TOPICS,
  PROJECT_BUDGETS,
  PROJECT_KINDS,
  PROJECT_TIMELINES,
  labelOf,
  type ContactInput,
} from "./validate";
import type { EmailPalette } from "./palette";

export type ContactEmail = { subject: string; html: string; text: string };

type EmailContext = {
  siteName: string;
  /** Public site address, when configured; shown in the footer. */
  siteUrl: string | null;
  receivedAt: Date;
  palette: EmailPalette;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Header injection guard: a subject is a single line of plain text. */
const oneLine = (value: string) => value.replace(/[\r\n\u2028\u2029]+/g, " ").trim();

function websiteUrl(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** What the subject line and the heading call the message. */
const SUBJECT_NOUN: Record<ContactInput["topic"], string> = {
  project: "New project enquiry",
  job: "New job opportunity",
  other: "New message",
};

/** The topic and its details as label/value pairs, in reading order. Empty details are left out. */
export function contactSummary(input: ContactInput): [label: string, value: string][] {
  const about =
    input.topic === "project" && input.projectKind
      ? `Project: ${labelOf(PROJECT_KINDS, input.projectKind)}`
      : labelOf(CONTACT_TOPICS, input.topic);
  const pairs: [string, string][] = [["About", about]];
  if (input.budget) pairs.push(["Budget", labelOf(PROJECT_BUDGETS, input.budget)]);
  if (input.timeline) pairs.push(["Timeline", labelOf(PROJECT_TIMELINES, input.timeline)]);
  if (input.company) pairs.push(["Company", input.company]);
  if (input.role) pairs.push(["Role", input.role]);
  return pairs;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** The designed notification: one card on paper, the message set in a quote block, one reply button. */
export function buildContactEmail(input: ContactInput, context: EmailContext): ContactEmail {
  const { palette: c } = context;
  const sender = input.name || input.email;
  const noun = SUBJECT_NOUN[input.topic];
  const subject = oneLine(`${noun} from ${sender}`).slice(0, 120);
  const summary = contactSummary(input);
  const received = context.receivedAt.toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const replyHref = `mailto:${input.email}?subject=${encodeURIComponent(`Re: your message to ${context.siteName}`)}`;
  const row = (label: string, value: string) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid ${c.border};width:110px;font:600 11px/1.4 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};vertical-align:top;">${label}</td>
          <td style="padding:12px 0;border-top:1px solid ${c.border};font:400 15px/1.5 ${SANS};color:${c.foreground};vertical-align:top;word-break:break-word;">${value}</td>
        </tr>`;
  const rows = [
    ...summary.map(([label, value]) => row(label, escapeHtml(value))),
    input.name ? row("Name", escapeHtml(input.name)) : "",
    ...(input.phone ? [row("Phone", escapeHtml(input.phone))] : []),
    row(
      "Email",
      `<a href="mailto:${escapeHtml(input.email)}" style="color:${c.accent};text-decoration:underline;">${escapeHtml(input.email)}</a>`,
    ),
    input.website
      ? row(
          "Website",
          `<a href="${escapeHtml(websiteUrl(input.website))}" style="color:${c.accent};text-decoration:underline;">${escapeHtml(input.website)}</a>`,
        )
      : "",
    row("Received", `${escapeHtml(received)} UTC`),
  ].join("");
  const footer = context.siteUrl
    ? `Sent from the contact form at ${escapeHtml(context.siteUrl)}`
    : `Sent from the contact form on ${escapeHtml(context.siteName)}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${c.background};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.message.slice(0, 120))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.background};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${c.surface};border:1px solid ${c.border};">
      <tr><td style="padding:28px 32px 0;">
        <div style="font:600 11px/1.4 ${SANS};letter-spacing:0.12em;text-transform:uppercase;color:${c.accent};">${escapeHtml(noun)}</div>
        <div style="margin-top:6px;font:400 15px/1.4 ${SERIF};color:${c.muted};">${escapeHtml(context.siteName)}</div>
      </td></tr>
      <tr><td style="padding:20px 32px 8px;">
        <h1 style="margin:0;font:400 32px/1.15 ${SERIF};color:${c.foreground};">${escapeHtml(sender)} wrote to you.</h1>
      </td></tr>
      <tr><td style="padding:16px 32px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
        </table>
      </td></tr>
      <tr><td style="padding:16px 32px 8px;">
        <div style="font:600 11px/1.4 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};">Message</div>
        <div style="margin-top:10px;padding:16px 20px;background:${c.subtle};border-left:3px solid ${c.accent};font:400 16px/1.6 ${SERIF};color:${c.foreground};white-space:pre-wrap;word-break:break-word;">${escapeHtml(input.message)}</div>
      </td></tr>
      <tr><td style="padding:24px 32px 32px;">
        <a href="${escapeHtml(replyHref)}" style="display:inline-block;padding:14px 28px;background:${c.foreground};color:${c.surface};font:600 13px/1 ${SANS};letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;border-radius:999px;">Reply to ${escapeHtml(input.name || "sender")}</a>
      </td></tr>
      <tr><td style="padding:16px 32px;background:${c.subtle};border-top:1px solid ${c.border};font:400 12px/1.5 ${SANS};color:${c.muted};">${footer}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `${noun} from ${sender}`,
    "",
    ...summary.map(([label, value]) => `${label}: ${value}`),
    ...(input.name ? [`Name: ${input.name}`] : []),
    `Email: ${input.email}`,
    ...(input.phone ? [`Phone: ${input.phone}`] : []),
    ...(input.website ? [`Website: ${input.website}`] : []),
    `Received: ${received} UTC`,
    "",
    input.message,
    "",
    `Reply: ${replyHref}`,
  ].join("\n");

  return { subject, html, text };
}
