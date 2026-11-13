import type { AboutContent, ContactDetails, HomeContent } from "../../content/site/types";
import { isValidWhatsappNumber } from "./whatsapp";

export type ContentProblem = {
  /** Repository path of the record file that holds the value. */
  readonly record: string;
  /** Field name, for example `introduction[0]` or `profiles[1].url`. */
  readonly field: string;
  readonly message: string;
};

export type SiteContentInput = {
  readonly siteName: string | null;
  readonly home: HomeContent;
  readonly about: AboutContent;
  readonly contact: ContactDetails;
};

export const RECORD_FILES = {
  identity: "src/content/site/identity.ts",
  home: "src/content/site/home.ts",
  about: "src/content/site/about.ts",
  contact: "src/content/site/contact.ts",
} as const;

const HTML_TAG = /<\/?[a-z][^>]*>/i;

function textProblem(value: string, singleLine: boolean): string | null {
  if (value.trim() === "") return "must not be empty.";
  if (value !== value.trim()) return "must not start or end with spaces.";
  if (singleLine && /[\r\n]/.test(value)) return "must be a single line.";
  if (HTML_TAG.test(value)) return "must be plain text without HTML tags.";
  return null;
}

export function isValidEmail(value: string): boolean {
  if (/\s/.test(value) || /[<>]/.test(value)) return false;
  if (/^mailto:/i.test(value)) return false;
  const match = /^([^@]+)@([^@]+)$/.exec(value);
  if (match === null) return false;
  const domain = match[2];
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..")) return false;
  return true;
}

export function profileUrlProblem(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "must be an absolute https:// address.";
  }
  if (parsed.protocol !== "https:") return "must start with https://.";
  if (parsed.username !== "" || parsed.password !== "") return "must not contain credentials.";
  if (!parsed.hostname.includes(".")) return "must have a public host name.";
  return null;
}

export function isAboutSupplied(about: AboutContent): boolean {
  return about.introduction.length > 0;
}

export function isContactSupplied(contact: ContactDetails): boolean {
  return contact.email !== null;
}

/** Structural problems only. Missing values are valid ("not supplied"); malformed values are not. */
export function validateSiteContent(input: SiteContentInput): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const add = (record: string, field: string, message: string) => {
    problems.push({ record, field, message });
  };

  if (input.siteName !== null) {
    const problem = textProblem(input.siteName, true);
    if (problem) add(RECORD_FILES.identity, "siteName", problem);
  }

  if (input.home.introduction !== null) {
    const problem = textProblem(input.home.introduction, true);
    if (problem) add(RECORD_FILES.home, "introduction", problem);
  }

  const lists = [
    ["introduction", input.about.introduction],
    ["approach", input.about.approach],
    ["background", input.about.background],
  ] as const;
  for (const [name, paragraphs] of lists) {
    paragraphs.forEach((paragraph, index) => {
      const problem = textProblem(paragraph, false);
      if (problem) add(RECORD_FILES.about, `${name}[${index}]`, problem);
    });
  }

  if (input.contact.email !== null && !isValidEmail(input.contact.email)) {
    add(
      RECORD_FILES.contact,
      "email",
      "must be a plain address such as name@domain.tld (no spaces, no mailto:, one @).",
    );
  }

  if (input.contact.whatsapp != null && !isValidWhatsappNumber(input.contact.whatsapp)) {
    add(
      RECORD_FILES.contact,
      "whatsapp",
      "must be digits only with the country code first, 8 to 15 digits (no plus sign or spaces).",
    );
  }

  (input.about.experience ?? []).forEach((entry, index) => {
    for (const [name, value] of [
      ["role", entry.role],
      ["detail", entry.detail],
      ...(entry.place === undefined ? [] : [["place", entry.place]]),
      ...(entry.period === undefined ? [] : [["period", entry.period]]),
    ] as const) {
      const problem = textProblem(value, true);
      if (problem) add(RECORD_FILES.about, `experience[${index}].${name}`, problem);
    }
  });

  const labels = new Set<string>();
  const urls = new Set<string>();
  input.contact.profiles.forEach((profile, index) => {
    const labelProblem = textProblem(profile.label, true);
    if (labelProblem) {
      add(RECORD_FILES.contact, `profiles[${index}].label`, labelProblem);
    } else {
      const key = profile.label.toLowerCase();
      if (labels.has(key)) {
        add(RECORD_FILES.contact, `profiles[${index}].label`, "must be unique in the list.");
      }
      labels.add(key);
    }
    const urlProblem = profileUrlProblem(profile.url);
    if (urlProblem) {
      add(RECORD_FILES.contact, `profiles[${index}].url`, urlProblem);
    } else {
      const key = profile.url.toLowerCase();
      if (urls.has(key)) {
        add(RECORD_FILES.contact, `profiles[${index}].url`, "must be unique in the list.");
      }
      urls.add(key);
    }
  });

  return problems;
}

/** Throws one error naming every bad record and field, so a build fails with a clear message. */
export function assertValidSiteContent(input: SiteContentInput): SiteContentInput {
  const problems = validateSiteContent(input);
  if (problems.length > 0) {
    const lines = problems.map((p) => `- ${p.record}: ${p.field}: ${p.message}`);
    throw new Error(`Invalid site content:\n${lines.join("\n")}`);
  }
  return input;
}
