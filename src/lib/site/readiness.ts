import type { AboutContent, ContactDetails, HomeContent } from "../../content/site/types";
import { RECORD_FILES, validateSiteContent, type ContentProblem } from "./content-rules";
import { checkPaths, scanSecrets, type HygieneFinding, type TrackedFile } from "./hygiene";
import { findPlaceholder } from "./placeholder-patterns";
import { siteUrlProblems } from "./site-origin";

export type ReadinessStatus = "pass" | "fail" | "open-decision" | "info";
export type ReadinessGroup = "required" | "placeholder" | "hygiene" | "decision" | "info";
export type ReportFormat = "text" | "markdown" | "json";

export type ReadinessItem = {
  readonly id: string;
  readonly group: ReadinessGroup;
  readonly status: ReadinessStatus;
  readonly label: string;
  readonly detail: string;
  readonly fix?: string;
};

export type ReadinessInput = {
  readonly siteName: string | null;
  readonly home: HomeContent;
  readonly about: AboutContent;
  readonly contact: ContactDetails;
  /** The value of SITE_URL as read, or `undefined` when not set. */
  readonly siteUrlRaw: string | undefined;
  /** Records without `sample: true`. */
  readonly realProjectCounts: {
    readonly digitalExperiences: number;
    readonly digitalProducts: number;
  };
  readonly trackedFiles: readonly TrackedFile[];
};

export type ReadinessReport = {
  readonly items: readonly ReadinessItem[];
  /** True only when no item failed. Open owner decisions do not block it. */
  readonly ready: boolean;
  readonly summary: {
    readonly fail: number;
    readonly pass: number;
    readonly openDecisions: number;
  };
};

type TextRef = { readonly record: string; readonly field: string; readonly value: string };
type PlaceholderHit = TextRef & { readonly patternId: string };

function collectTexts(input: ReadinessInput): TextRef[] {
  const refs: TextRef[] = [];
  if (input.siteName !== null) {
    refs.push({ record: RECORD_FILES.identity, field: "siteName", value: input.siteName });
  }
  if (input.home.introduction !== null) {
    refs.push({ record: RECORD_FILES.home, field: "introduction", value: input.home.introduction });
  }
  const lists = [
    ["introduction", input.about.introduction],
    ["approach", input.about.approach],
    ["background", input.about.background],
  ] as const;
  for (const [name, paragraphs] of lists) {
    paragraphs.forEach((value, index) => {
      refs.push({ record: RECORD_FILES.about, field: `${name}[${index}]`, value });
    });
  }
  if (input.contact.email !== null) {
    refs.push({ record: RECORD_FILES.contact, field: "email", value: input.contact.email });
  }
  input.contact.profiles.forEach((profile, index) => {
    refs.push({
      record: RECORD_FILES.contact,
      field: `profiles[${index}].label`,
      value: profile.label,
    });
    refs.push({
      record: RECORD_FILES.contact,
      field: `profiles[${index}].url`,
      value: profile.url,
    });
  });
  return refs;
}

function placeholderHits(refs: readonly TextRef[]): PlaceholderHit[] {
  return refs.flatMap((ref) => {
    const patternId = findPlaceholder(ref.value);
    return patternId === null ? [] : [{ ...ref, patternId }];
  });
}

function problemsFor(
  problems: readonly ContentProblem[],
  hits: readonly PlaceholderHit[],
  record: string,
  matches: (field: string) => boolean,
): string[] {
  const structural = problems
    .filter((problem) => problem.record === record && matches(problem.field))
    .map((problem) => `${problem.field} ${problem.message}`);
  const placeholders = hits
    .filter((hit) => hit.record === record && matches(hit.field))
    .map((hit) => `${hit.field} looks like placeholder text (${hit.patternId}).`);
  return [...structural, ...placeholders];
}

function requiredItem(args: {
  id: string;
  label: string;
  where: string;
  supplied: boolean;
  problems: readonly string[];
  fix: string;
}): ReadinessItem {
  const base = { id: args.id, group: "required" as const, label: args.label };
  if (!args.supplied) {
    return { ...base, status: "fail", detail: `Not supplied (${args.where}).`, fix: args.fix };
  }
  if (args.problems.length > 0) {
    return { ...base, status: "fail", detail: args.problems.join(" "), fix: args.fix };
  }
  return { ...base, status: "pass", detail: `Supplied (${args.where}).` };
}

function describeFindings(findings: readonly HygieneFinding[]): string {
  const shown = findings.slice(0, 10).map((finding) => {
    const where = finding.line === null ? finding.path : `${finding.path}:${finding.line}`;
    return `${where} (${finding.rule})`;
  });
  const more = findings.length > shown.length ? ` and ${findings.length - shown.length} more` : "";
  return `${shown.join("; ")}${more}`;
}

/** Pure: no file system, no network. All inputs are passed in. */
export function evaluateReadiness(input: ReadinessInput): ReadinessReport {
  const contentProblems = validateSiteContent({
    siteName: input.siteName,
    home: input.home,
    about: input.about,
    contact: input.contact,
  });
  const refs = collectTexts(input);
  const hits = placeholderHits(refs);
  const items: ReadinessItem[] = [];

  items.push(
    requiredItem({
      id: "required.site-name",
      label: "Site name or wordmark",
      where: `${RECORD_FILES.identity}, siteName`,
      supplied: input.siteName !== null,
      problems: problemsFor(contentProblems, hits, RECORD_FILES.identity, (f) => f === "siteName"),
      fix: "Set siteName to the name or wordmark you want shown across the site.",
    }),
    requiredItem({
      id: "required.about-introduction",
      label: "About introduction",
      where: `${RECORD_FILES.about}, introduction`,
      supplied: input.about.introduction.length > 0,
      problems: problemsFor(contentProblems, hits, RECORD_FILES.about, (f) =>
        f.startsWith("introduction"),
      ),
      fix: "Add at least one plain-text paragraph to the introduction list.",
    }),
    requiredItem({
      id: "required.home-introduction",
      label: "Home-page introduction",
      where: `${RECORD_FILES.home}, introduction`,
      supplied: input.home.introduction !== null,
      problems: problemsFor(contentProblems, hits, RECORD_FILES.home, (f) => f === "introduction"),
      fix: "Set introduction to one plain-text paragraph for the home page.",
    }),
    requiredItem({
      id: "required.email",
      label: "Email address",
      where: `${RECORD_FILES.contact}, email`,
      supplied: input.contact.email !== null,
      problems: problemsFor(contentProblems, hits, RECORD_FILES.contact, (f) => f === "email"),
      fix: "Set email to your public address, for example name@domain.tld.",
    }),
  );

  const rawUrl = input.siteUrlRaw;
  const urlSupplied = rawUrl !== undefined && rawUrl.trim() !== "";
  items.push(
    requiredItem({
      id: "required.site-url",
      label: "Public site address",
      where: "environment variable SITE_URL",
      supplied: urlSupplied,
      problems: urlSupplied ? siteUrlProblems(rawUrl) : [],
      fix: "Set SITE_URL to the public https:// address of the site (no path), here and in Vercel.",
    }),
  );

  items.push({
    id: "placeholder.content",
    group: "placeholder",
    status: hits.length === 0 ? "pass" : "fail",
    label: "No placeholder-looking text in supplied content",
    detail:
      hits.length === 0
        ? "None found."
        : hits.map((hit) => `${hit.record} ${hit.field} (${hit.patternId})`).join("; "),
    ...(hits.length === 0 ? {} : { fix: "Replace the flagged text with real content." }),
  });

  const pathFindings = checkPaths(input.trackedFiles.map((file) => file.path));
  items.push({
    id: "hygiene.paths",
    group: "hygiene",
    status: pathFindings.length === 0 ? "pass" : "fail",
    label: "No environment files, keys or generated output tracked or unignored",
    detail: pathFindings.length === 0 ? "None found." : describeFindings(pathFindings),
    ...(pathFindings.length === 0
      ? {}
      : { fix: "Remove the file from version control or add it to .gitignore." }),
  });
  const secretFindings = scanSecrets(input.trackedFiles);
  items.push({
    id: "hygiene.secrets",
    group: "hygiene",
    status: secretFindings.length === 0 ? "pass" : "fail",
    label: "No secret patterns found",
    detail: secretFindings.length === 0 ? "None found." : describeFindings(secretFindings),
    ...(secretFindings.length === 0
      ? {}
      : { fix: "Remove the value, or mark a reviewed false positive with the allow marker." }),
  });

  const sections = [
    [
      "decision.digital-experiences-empty",
      "Websites & E-commerce",
      input.realProjectCounts.digitalExperiences,
    ],
    [
      "decision.digital-products-empty",
      "SaaS & Dashboards",
      input.realProjectCounts.digitalProducts,
    ],
  ] as const;
  for (const [id, name, count] of sections) {
    items.push(
      count === 0
        ? {
            id,
            group: "decision",
            status: "open-decision",
            label: `${name} has no real projects`,
            detail: `Decide whether to launch with ${name} empty or add projects first.`,
          }
        : {
            id,
            group: "decision",
            status: "info",
            label: `${name} has real projects`,
            detail: `${count} real record${count === 1 ? "" : "s"}.`,
          },
    );
  }

  items.push(
    {
      id: "info.profile-links",
      group: "info",
      status: "info",
      label: "Profile links",
      detail:
        input.contact.profiles.length === 0
          ? "None supplied (optional)."
          : `${input.contact.profiles.length} supplied.`,
    },
    {
      id: "info.about-approach",
      group: "info",
      status: "info",
      label: "About approach",
      detail: input.about.approach.length === 0 ? "Not supplied (optional)." : "Supplied.",
    },
    {
      id: "info.about-background",
      group: "info",
      status: "info",
      label: "About background",
      detail: input.about.background.length === 0 ? "Not supplied (optional)." : "Supplied.",
    },
  );

  const fail = items.filter((item) => item.status === "fail").length;
  const pass = items.filter((item) => item.status === "pass").length;
  const openDecisions = items.filter((item) => item.status === "open-decision").length;
  return { items, ready: fail === 0, summary: { fail, pass, openDecisions } };
}

const GROUP_ORDER: readonly ReadinessGroup[] = [
  "required",
  "placeholder",
  "hygiene",
  "decision",
  "info",
];

const GROUP_TITLE: Record<ReadinessGroup, string> = {
  required: "REQUIRED",
  placeholder: "PLACEHOLDER TEXT",
  hygiene: "REPOSITORY HYGIENE",
  decision: "OWNER DECISIONS (never failures)",
  info: "INFO",
};

const STATUS_LABEL: Record<ReadinessStatus, string> = {
  pass: "PASS",
  fail: "FAIL",
  "open-decision": "OPEN",
  info: "INFO",
};

const APPROVAL_NOTE =
  "Passing this command is necessary but not sufficient. Launch needs the owner's explicit approval.";

function resultLine(report: ReadinessReport): string {
  const { fail, pass, openDecisions } = report.summary;
  return `RESULT: ${report.ready ? "READY" : "NOT READY"} (${fail} failing, ${pass} passing, ${openDecisions} open decisions)`;
}

function formatText(report: ReadinessReport): string {
  const lines = [
    "Launch readiness (content and repository gate)",
    "Build success is separate: this command does not build the site.",
    "",
  ];
  for (const group of GROUP_ORDER) {
    const items = report.items.filter((item) => item.group === group);
    if (items.length === 0) continue;
    lines.push(GROUP_TITLE[group]);
    for (const item of items) {
      lines.push(`  ${STATUS_LABEL[item.status].padEnd(4)}  ${item.label}: ${item.detail}`);
      if (item.fix !== undefined) lines.push(`        Fix: ${item.fix}`);
    }
    lines.push("");
  }
  lines.push(resultLine(report), APPROVAL_NOTE);
  return `${lines.join("\n")}\n`;
}

const escapeCell = (value: string) => value.replace(/\|/g, "\\|");

function formatMarkdown(report: ReadinessReport): string {
  const lines = ["Launch readiness (content and repository gate). Build success is separate.", ""];
  for (const group of GROUP_ORDER) {
    const items = report.items.filter((item) => item.group === group);
    if (items.length === 0) continue;
    lines.push(
      `**${GROUP_TITLE[group]}**`,
      "",
      "| Status | Item | Detail |",
      "| ------ | ---- | ------ |",
    );
    for (const item of items) {
      const detail = item.fix === undefined ? item.detail : `${item.detail} Fix: ${item.fix}`;
      lines.push(
        `| ${STATUS_LABEL[item.status]} | ${escapeCell(item.label)} | ${escapeCell(detail)} |`,
      );
    }
    lines.push("");
  }
  lines.push(`**${resultLine(report)}**`, "", APPROVAL_NOTE);
  return `${lines.join("\n")}\n`;
}

export function formatReport(report: ReadinessReport, format: ReportFormat): string {
  if (format === "json") return `${JSON.stringify(report, null, 2)}\n`;
  if (format === "markdown") return formatMarkdown(report);
  return formatText(report);
}
