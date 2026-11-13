import { describe, expect, it } from "vitest";
import { evaluateReadiness, formatReport, type ReadinessInput } from "./readiness";

const clean = [{ path: "src/app/page.tsx", text: "export default function Page() {}" }];

const complete: ReadinessInput = {
  siteName: "Studio Name",
  home: {
    headline: "Sample headline",

    introduction: "One plain sentence about the work.",
  },
  about: { introduction: ["A real paragraph."], approach: [], background: [] },
  contact: { email: "name@studio.co.uk", profiles: [] },
  siteUrlRaw: "https://studio.co.uk",
  realProjectCounts: { digitalExperiences: 2, digitalProducts: 1 },
  trackedFiles: clean,
};

const empty: ReadinessInput = {
  siteName: null,
  home: { headline: "Sample headline", introduction: null },
  about: { introduction: [], approach: [], background: [] },
  contact: { email: null, profiles: [] },
  siteUrlRaw: undefined,
  realProjectCounts: { digitalExperiences: 0, digitalProducts: 0 },
  trackedFiles: clean,
};

const statusOf = (input: ReadinessInput) =>
  Object.fromEntries(evaluateReadiness(input).items.map((item) => [item.id, item.status]));

const REQUIRED = [
  "required.site-name",
  "required.about-introduction",
  "required.home-introduction",
  "required.email",
  "required.site-url",
];

describe("evaluateReadiness: passing case", () => {
  it("is ready when every required item is supplied and valid", () => {
    const report = evaluateReadiness(complete);
    expect(report.ready).toBe(true);
    expect(report.summary.fail).toBe(0);
    const statuses = statusOf(complete);
    for (const id of REQUIRED) expect(statuses[id], id).toBe("pass");
    expect(statuses["placeholder.content"]).toBe("pass");
    expect(statuses["hygiene.paths"]).toBe("pass");
    expect(statuses["hygiene.secrets"]).toBe("pass");
  });

  it("does not require optional items", () => {
    const report = evaluateReadiness(complete);
    expect(report.ready).toBe(true);
    const statuses = statusOf(complete);
    expect(statuses["info.profile-links"]).toBe("info");
    expect(statuses["info.about-approach"]).toBe("info");
    expect(statuses["info.about-background"]).toBe("info");
  });
});

describe("evaluateReadiness: failing cases", () => {
  it("fails with all five required items failing when nothing is supplied", () => {
    const report = evaluateReadiness(empty);
    expect(report.ready).toBe(false);
    const statuses = statusOf(empty);
    for (const id of REQUIRED) expect(statuses[id], id).toBe("fail");
  });

  it("never reports a missing required value as passing", () => {
    for (const item of evaluateReadiness(empty).items) {
      if (item.group === "required") expect(item.status, item.id).not.toBe("pass");
    }
  });

  it.each([
    ["required.site-name", { ...complete, siteName: null }],
    [
      "required.about-introduction",
      { ...complete, about: { ...complete.about, introduction: [] } },
    ],
    [
      "required.home-introduction",
      { ...complete, home: { headline: "Sample headline", introduction: null } },
    ],
    ["required.email", { ...complete, contact: { email: null, profiles: [] } }],
    ["required.site-url", { ...complete, siteUrlRaw: undefined }],
    ["required.site-url", { ...complete, siteUrlRaw: "  " }],
  ])("fails %s when it alone is missing", (id, input) => {
    const statuses = statusOf(input);
    expect(statuses[id]).toBe("fail");
    for (const other of REQUIRED.filter((candidate) => candidate !== id)) {
      expect(statuses[other], other).toBe("pass");
    }
    expect(evaluateReadiness(input).ready).toBe(false);
  });

  it("names the record and field of a missing item", () => {
    const item = evaluateReadiness(empty).items.find((i) => i.id === "required.email");
    expect(item?.detail).toContain("src/content/site/contact.ts");
    expect(item?.detail).toContain("email");
  });

  it("fails a malformed email", () => {
    const input = { ...complete, contact: { email: "not-an-email", profiles: [] } };
    expect(statusOf(input)["required.email"]).toBe("fail");
  });

  it("fails a placeholder-looking email and also the placeholder check", () => {
    const input = { ...complete, contact: { email: "name@example.com", profiles: [] } };
    const statuses = statusOf(input);
    expect(statuses["required.email"]).toBe("fail");
    expect(statuses["placeholder.content"]).toBe("fail");
  });

  it("fails placeholder text in an optional field without failing the required items", () => {
    const input = { ...complete, about: { ...complete.about, approach: ["Lorem ipsum dolor."] } };
    const statuses = statusOf(input);
    expect(statuses["placeholder.content"]).toBe("fail");
    for (const id of REQUIRED) expect(statuses[id], id).toBe("pass");
    expect(evaluateReadiness(input).ready).toBe(false);
  });

  it.each([
    "https://localhost:3000",
    "https://portfolio.example",
    "http://studio.co.uk",
    "nonsense",
  ])("fails an unusable site address: %s", (siteUrlRaw) => {
    expect(statusOf({ ...complete, siteUrlRaw })["required.site-url"]).toBe("fail");
  });

  it("fails when an environment file is tracked", () => {
    const input = {
      ...complete,
      trackedFiles: [...clean, { path: ".env.local", text: null }],
    };
    expect(statusOf(input)["hygiene.paths"]).toBe("fail");
    expect(evaluateReadiness(input).ready).toBe(false);
  });

  it("fails on a secret pattern without printing the secret", () => {
    const secret = "AKIA" + "ABCDEFGHIJKLMNOP";
    const input = {
      ...complete,
      trackedFiles: [...clean, { path: "src/x.ts", text: `const a = "${secret}";` }],
    };
    const report = evaluateReadiness(input);
    const item = report.items.find((i) => i.id === "hygiene.secrets");
    expect(item?.status).toBe("fail");
    expect(item?.detail).toContain("src/x.ts:1");
    expect(JSON.stringify(report)).not.toContain(secret);
  });
});

describe("evaluateReadiness: owner decisions", () => {
  it("lists empty project sections as open decisions that never fail", () => {
    const input = { ...complete, realProjectCounts: { digitalExperiences: 0, digitalProducts: 0 } };
    const report = evaluateReadiness(input);
    const statuses = statusOf(input);
    expect(statuses["decision.digital-experiences-empty"]).toBe("open-decision");
    expect(statuses["decision.digital-products-empty"]).toBe("open-decision");
    expect(report.summary.openDecisions).toBe(2);
    expect(report.ready).toBe(true);
  });

  it("reports sections that have real projects as information", () => {
    const statuses = statusOf(complete);
    expect(statuses["decision.digital-experiences-empty"]).toBe("info");
    expect(statuses["decision.digital-products-empty"]).toBe("info");
  });
});

describe("formatReport", () => {
  it("prints NOT READY, the failing items and the approval note", () => {
    const text = formatReport(evaluateReadiness(empty), "text");
    expect(text).toContain("RESULT: NOT READY");
    expect(text).toContain("FAIL");
    expect(text).toContain("About introduction");
    expect(text).toContain("OPEN");
    expect(text).toContain("explicit approval");
  });

  it("prints READY and still the approval note when everything passes", () => {
    const text = formatReport(evaluateReadiness(complete), "text");
    expect(text).toContain("RESULT: READY");
    expect(text).not.toContain("NOT READY");
    expect(text).toContain("explicit approval");
  });

  it("prints markdown tables", () => {
    const markdown = formatReport(evaluateReadiness(empty), "markdown");
    expect(markdown).toContain("| Status | Item | Detail |");
    expect(markdown).toContain("NOT READY");
  });

  it("prints parseable json", () => {
    const parsed = JSON.parse(formatReport(evaluateReadiness(empty), "json")) as {
      ready: boolean;
      items: unknown[];
    };
    expect(parsed.ready).toBe(false);
    expect(parsed.items.length).toBeGreaterThan(5);
  });
});
