import { isValidEmail } from "@/lib/site/content-rules";

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  website: 300,
  company: 120,
  role: 120,
  messageMin: 10,
  messageMax: 4000,
} as const;

/** What the sender is reaching out about. Required: it sorts the message on arrival. */
export const CONTACT_TOPICS = [
  { value: "project", label: "A project" },
  { value: "job", label: "A job opportunity" },
  { value: "other", label: "Something else" },
] as const;

/** For a project: the kind of work, after the two areas on the site. Optional. */
export const PROJECT_KINDS = [
  { value: "store", label: "Online store" },
  { value: "website", label: "Website or landing page" },
  { value: "dashboard", label: "Dashboard or admin tool" },
  { value: "saas", label: "SaaS product" },
  { value: "unsure", label: "Not sure yet" },
] as const;

/** For a project: a rough budget. Optional. */
export const PROJECT_BUDGETS = [
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-3k", label: "$1,000 – $3,000" },
  { value: "3k-10k", label: "$3,000 – $10,000" },
  { value: "10k-plus", label: "$10,000 or more" },
  { value: "unsure", label: "Not sure yet" },
] as const;

/** For a project: when it should start or be ready. Optional. */
export const PROJECT_TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-month", label: "Within a month" },
  { value: "1-3-months", label: "In 1 to 3 months" },
  { value: "flexible", label: "Flexible" },
] as const;

type Option = { readonly value: string; readonly label: string };
type ValueOf<T extends readonly Option[]> = T[number]["value"];

export type ContactTopic = ValueOf<typeof CONTACT_TOPICS>;
export type ProjectKind = ValueOf<typeof PROJECT_KINDS>;
export type ProjectBudget = ValueOf<typeof PROJECT_BUDGETS>;
export type ProjectTimeline = ValueOf<typeof PROJECT_TIMELINES>;

export type ContactField =
  | "topic"
  | "name"
  | "email"
  | "phone"
  | "website"
  | "projectKind"
  | "budget"
  | "timeline"
  | "company"
  | "role"
  | "message";

/**
 * A validated message. Fields that belong to another topic are always empty, so a project
 * enquiry never carries a company and a job offer never carries a budget.
 */
export type ContactInput = {
  topic: ContactTopic;
  name: string;
  email: string;
  /** Optional: a number for a call or WhatsApp. */
  phone: string;
  website: string;
  projectKind: ProjectKind | "";
  budget: ProjectBudget | "";
  timeline: ProjectTimeline | "";
  company: string;
  role: string;
  message: string;
};

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactResult =
  { ok: true; value: ContactInput } | { ok: false; errors: ContactErrors };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pick<T extends readonly Option[]>(options: T, value: string): ValueOf<T> | undefined {
  return options.find((option) => option.value === value)?.value as ValueOf<T> | undefined;
}

/** The label shown for a stored value, or the value itself if it is unknown. */
export function labelOf(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** The message box's label follows the topic, so the question always fits. */
export function messageLabel(topic: string): string {
  if (topic === "job") return "Tell me about the role";
  if (topic === "other") return "Your message";
  return "What are you building?";
}

/** Digits with spaces, dots, dashes or brackets and an optional leading +; 6 to 15 digits (E.164). */
export function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return (
    value.length <= CONTACT_LIMITS.phone &&
    /^\+?[\d\s().-]+$/.test(value) &&
    digits >= 6 &&
    digits <= 15
  );
}

/** One validator for the browser and the server, so the two can never disagree. */
export function validateContact(raw: Record<string, unknown>): ContactResult {
  const errors: ContactErrors = {};
  const topic = pick(CONTACT_TOPICS, text(raw.topic));
  if (!topic) errors.topic = "Choose what you are reaching out about.";

  const isProject = topic === "project";
  const isJob = topic === "job";
  const optional = <T extends readonly Option[]>(
    field: ContactField,
    options: T,
    rawValue: unknown,
  ): ValueOf<T> | "" => {
    const value = text(rawValue);
    if (!isProject || value === "") return "";
    const known = pick(options, value);
    if (!known) errors[field] = "Choose one of the options, or leave it empty.";
    return known ?? "";
  };

  const value: ContactInput = {
    topic: topic ?? "other",
    name: text(raw.name),
    email: text(raw.email),
    phone: text(raw.phone),
    website: text(raw.website),
    projectKind: optional("projectKind", PROJECT_KINDS, raw.projectKind),
    budget: optional("budget", PROJECT_BUDGETS, raw.budget),
    timeline: optional("timeline", PROJECT_TIMELINES, raw.timeline),
    company: isJob ? text(raw.company) : "",
    role: isJob ? text(raw.role) : "",
    message: text(raw.message),
  };

  if (value.name.length > CONTACT_LIMITS.name)
    errors.name = `Keep your name under ${CONTACT_LIMITS.name} characters.`;

  if (value.email === "") errors.email = "Enter your email address so I can reply.";
  else if (value.email.length > CONTACT_LIMITS.email || !isValidEmail(value.email))
    errors.email = "Enter a valid email address, like name@example.com.";

  if (value.phone !== "" && !isPhone(value.phone))
    errors.phone = "Enter a phone number, like +20 111 000 0000, or leave it empty.";

  if (value.company.length > CONTACT_LIMITS.company)
    errors.company = `Keep the company name under ${CONTACT_LIMITS.company} characters.`;
  if (value.role.length > CONTACT_LIMITS.role)
    errors.role = `Keep the role under ${CONTACT_LIMITS.role} characters.`;

  if (value.message === "")
    errors.message =
      value.topic === "job"
        ? "Tell me a little about the role."
        : value.topic === "project"
          ? "Tell me a little about what you are building."
          : "Write your message.";
  else if (value.message.length < CONTACT_LIMITS.messageMin)
    errors.message = `Write at least ${CONTACT_LIMITS.messageMin} characters.`;
  else if (value.message.length > CONTACT_LIMITS.messageMax)
    errors.message = `Keep the message under ${CONTACT_LIMITS.messageMax} characters.`;

  if (value.website !== "") {
    let valid = value.website.length <= CONTACT_LIMITS.website;
    if (valid) {
      try {
        const url = new URL(
          /^https?:\/\//i.test(value.website) ? value.website : `https://${value.website}`,
        );
        valid =
          (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
      } catch {
        valid = false;
      }
    }
    if (!valid) errors.website = "Enter a website address, like example.com, or leave it empty.";
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
