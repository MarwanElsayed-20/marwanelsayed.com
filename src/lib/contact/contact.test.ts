import { describe, expect, it, vi } from "vitest";
import { buildContactEmail } from "./email";
import { paletteFromTokens } from "./palette";
import { createRateLimiter } from "./rate-limit";
import { DEFAULT_ENDPOINT, deliver } from "./send";
import { CONTACT_LIMITS, validateContact, type ContactInput } from "./validate";

const tokens = {
  "color-background": "#111111",
  "color-surface": "#222222",
  "color-surface-subtle": "#333333",
  "color-foreground": "#444444",
  "color-muted": "#555555",
  "color-accent": "#666666",
  "color-border": "#777777",
};
const palette = paletteFromTokens(tokens);
const valid: ContactInput = {
  topic: "project",
  name: "Sam",
  email: "sam@studio.co",
  phone: "",
  website: "",
  projectKind: "",
  budget: "",
  timeline: "",
  company: "",
  role: "",
  message: "I would like a storefront.",
};

describe("validateContact", () => {
  it("accepts a complete message and trims every field", () => {
    const result = validateContact({ ...valid, name: "  Sam  ", website: " studio.co " });
    expect(result).toEqual({
      ok: true,
      value: { ...valid, website: "studio.co" },
    });
  });

  it("only requires a topic, an email and a message", () => {
    expect(validateContact({ topic: "other", email: "a@b.co", message: "Ten chars!!" }).ok).toBe(
      true,
    );
    const missing = validateContact({ email: "a@b.co", message: "Ten chars!!" });
    expect(missing.ok ? null : missing.errors.topic).toMatch(/reaching out/i);
    expect(validateContact({ topic: "spam", email: "a@b.co", message: "Ten chars!!" }).ok).toBe(
      false,
    );
  });

  it("keeps a project's details and checks them against the options", () => {
    const result = validateContact({
      ...valid,
      projectKind: "store",
      budget: "3k-10k",
      timeline: "asap",
      company: "Acme",
    });
    expect(result.ok && result.value).toMatchObject({
      projectKind: "store",
      budget: "3k-10k",
      timeline: "asap",
      company: "",
    });
    const bad = validateContact({ ...valid, budget: "a million" });
    expect(bad.ok ? null : bad.errors.budget).toMatch(/options/);
  });

  it("accepts an optional phone number and refuses anything that is not one", () => {
    const result = validateContact({ ...valid, phone: " +20 (100) 000-1234 " });
    expect(result.ok && result.value.phone).toBe("+20 (100) 000-1234");
    for (const phone of ["call me", "12345", "1234567890123456", "+20 111 <b>"]) {
      const bad = validateContact({ ...valid, phone });
      expect(bad.ok ? null : bad.errors.phone).toMatch(/phone number/);
    }
  });

  it("keeps a job's company and role and drops project details", () => {
    const result = validateContact({
      ...valid,
      topic: "job",
      company: " Acme ",
      role: "Front-end engineer",
      budget: "3k-10k",
    });
    expect(result.ok && result.value).toMatchObject({
      topic: "job",
      company: "Acme",
      role: "Front-end engineer",
      budget: "",
    });
    const long = validateContact({ ...valid, topic: "job", role: "x".repeat(121) });
    expect(long.ok ? null : long.errors.role).toMatch(/120/);
  });

  it("reports each problem against its field", () => {
    const result = validateContact({
      topic: "project",
      name: "x".repeat(101),
      email: "nope",
      message: "short",
      website: "not a site",
    });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(Object.keys(result.errors).sort()).toEqual(["email", "message", "name", "website"]);
  });

  it("asks for what is missing", () => {
    const result = validateContact({ topic: "project" });
    if (result.ok) throw new Error("expected failure");
    expect(result.errors.email).toMatch(/email/i);
    expect(result.errors.message).toMatch(/building/i);
  });

  it("enforces the message limits and ignores non-string input", () => {
    expect(
      validateContact({ ...valid, message: "x".repeat(CONTACT_LIMITS.messageMax + 1) }).ok,
    ).toBe(false);
    expect(validateContact({ ...valid, message: { not: "text" } }).ok).toBe(false);
  });
});

describe("buildContactEmail", () => {
  const context = {
    siteName: "Studio",
    siteUrl: "https://studio.co",
    receivedAt: new Date("2026-10-22T09:30:00Z"),
    palette,
  };

  it("builds a designed email from the design tokens", () => {
    const email = buildContactEmail({ ...valid, website: "studio.co" }, context);
    expect(email.subject).toBe("New project enquiry from Sam");
    expect(email.html).toContain("Sam wrote to you.");
    expect(email.html).toContain("#666666");
    expect(email.html).toContain("https://studio.co");
    expect(email.html).toContain("mailto:sam@studio.co");
    expect(email.text).toContain("Email: sam@studio.co");
    expect(email.text).toContain("I would like a storefront.");
  });

  it("escapes everything a visitor typed", () => {
    const email = buildContactEmail(
      {
        ...valid,
        topic: "job",
        name: "<b>Eve</b>",
        email: "eve@x.co",
        message: "<script>alert(1)</script> & more",
        website: "x.co",
        company: "<i>Co</i>",
      },
      context,
    );
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<b>Eve</b>");
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; more");
    expect(email.html).not.toContain("<i>Co</i>");
  });

  it("leads with the topic and its details, and names the topic in the subject", () => {
    const project = buildContactEmail(
      { ...valid, projectKind: "store", budget: "3k-10k", timeline: "asap" },
      context,
    );
    expect(project.text).toContain("About: Project: Online store");
    expect(project.text).toContain("Budget: $3,000 – $10,000");
    expect(project.text).toContain("Timeline: As soon as possible");
    expect(project.text).not.toContain("Phone:");
    const withPhone = buildContactEmail({ ...valid, phone: "+20 111 000 0000" }, context);
    expect(withPhone.text).toContain("Phone: +20 111 000 0000");
    expect(withPhone.html).toContain("+20 111 000 0000");
    const job = buildContactEmail(
      { ...valid, topic: "job", company: "Acme", role: "Front-end engineer" },
      context,
    );
    expect(job.subject).toBe("New job opportunity from Sam");
    expect(job.text).toContain("Company: Acme");
    expect(job.text).toContain("Role: Front-end engineer");
    expect(job.html).toContain("New job opportunity");
    expect(buildContactEmail({ ...valid, topic: "other" }, context).subject).toBe(
      "New message from Sam",
    );
  });

  it("keeps the subject on one line", () => {
    const email = buildContactEmail(
      { ...valid, name: "Sam" + String.fromCharCode(13, 10) + "Bcc: x@y.z" },
      context,
    );
    expect(email.subject).not.toMatch(/[\r\n]/);
  });

  it("names the site address when configured and the site otherwise", () => {
    expect(buildContactEmail(valid, { ...context, siteUrl: null }).html).toContain(
      "contact form on Studio",
    );
  });
});

describe("paletteFromTokens", () => {
  it("fails loudly when a token is missing", () => {
    expect(() => paletteFromTokens({})).toThrow(/Missing design token/);
  });
});

describe("createRateLimiter", () => {
  it("allows the limit within the window, then refuses, then recovers", () => {
    let now = 0;
    const allow = createRateLimiter(2, 1000, () => now);
    expect([allow("a"), allow("a"), allow("a")]).toEqual([true, true, false]);
    expect(allow("b")).toBe(true);
    now = 1001;
    expect(allow("a")).toBe(true);
  });
});

describe("deliver", () => {
  const config = { apiKey: "key", from: "Studio <a@b.co>", to: "me@b.co" };
  const message = { subject: "S", html: "<p>h</p>", text: "t", replyTo: "sam@studio.co" };

  it("posts the email to the delivery API with the key and reply-to", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    expect(await deliver(config, message, fetchImpl)).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(DEFAULT_ENDPOINT);
    expect(init.headers.Authorization).toBe("Bearer key");
    expect(JSON.parse(init.body)).toMatchObject({
      to: ["me@b.co"],
      reply_to: "sam@studio.co",
      subject: "S",
    });
  });

  it("reports a rejection and an unreachable service without throwing", async () => {
    expect(
      await deliver(
        config,
        message,
        vi.fn().mockResolvedValue(new Response("{}", { status: 422 })),
      ),
    ).toEqual({
      ok: false,
      reason: "rejected",
    });
    expect(await deliver(config, message, vi.fn().mockRejectedValue(new Error("down")))).toEqual({
      ok: false,
      reason: "unreachable",
    });
  });
});

describe("ingestConfig and sendToDashboard", () => {
  it("needs both settings and an https address (http only on localhost)", async () => {
    const { ingestConfig } = await import("./ingest");
    expect(ingestConfig({})).toBeNull();
    expect(ingestConfig({ DASHBOARD_INGEST_URL: "https://d.co/api/ingest" })).toBeNull();
    expect(
      ingestConfig({
        DASHBOARD_INGEST_URL: "http://d.co/api/ingest",
        DASHBOARD_INGEST_SECRET: "k",
      }),
    ).toBeNull();
    expect(
      ingestConfig({
        DASHBOARD_INGEST_URL: "http://127.0.0.1:3998/i",
        DASHBOARD_INGEST_SECRET: "k",
      }),
    ).toEqual({ url: "http://127.0.0.1:3998/i", secret: "k" });
  });

  it("posts the message with the key and reports a coarse result", async () => {
    const { sendToDashboard } = await import("./ingest");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    const config = { url: "https://d.co/api/ingest", secret: "k" };
    expect(await sendToDashboard(config, valid, fetchMock)).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://d.co/api/ingest");
    expect(init.headers.Authorization).toBe("Bearer k");
    expect(JSON.parse(init.body)).toMatchObject({ topic: "project", email: "sam@studio.co" });
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));
    expect(await sendToDashboard(config, valid, fetchMock)).toEqual({
      ok: false,
      reason: "rejected",
    });
    fetchMock.mockRejectedValue(new Error("down"));
    expect(await sendToDashboard(config, valid, fetchMock)).toEqual({
      ok: false,
      reason: "unreachable",
    });
  });
});
