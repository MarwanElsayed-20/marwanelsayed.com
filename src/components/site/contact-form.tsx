"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  PROJECT_BUDGETS,
  PROJECT_KINDS,
  PROJECT_TIMELINES,
  messageLabel,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/validate";
import { TRAP_FIELD } from "@/lib/contact/trap";
import { sendSignal } from "@/lib/track/send";

type Status = "idle" | "sending" | "sent" | "failed";

type ContactFormProps = {
  /** Shown as the fallback whenever delivery fails or is not configured. */
  email: string | null;
};

type Option = { readonly value: string; readonly label: string };

const FIELD_ORDER: readonly ContactField[] = [
  "topic",
  "name",
  "email",
  "phone",
  "projectKind",
  "budget",
  "timeline",
  "company",
  "role",
  "website",
  "message",
];

const fieldClass =
  "w-full rounded-none border-0 border-b border-foreground bg-transparent px-0 py-3 text-body text-foreground placeholder:text-muted transition-[box-shadow] duration-(--duration-fast) ease-standard focus-visible:shadow-[0_2px_0_var(--color-foreground)] aria-[invalid=true]:border-accent";
const labelClass = "text-label font-medium tracking-widest text-muted uppercase";
const pillClass =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border-strong px-5 text-small text-foreground transition-colors duration-(--duration-fast) ease-standard peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus hover:border-foreground";

function messageFor(status: number): string {
  if (status === 429)
    return "That was a lot of messages in a short time. Please try again in a few minutes.";
  if (status === 503) return "This form is not connected yet, so your message was not sent.";
  return "Something went wrong and your message was not sent.";
}

const Optional = () => <span className="font-normal normal-case">(optional)</span>;

/**
 * The contact form. It asks first what the message is about (a project, a job, something else) and
 * shows only that topic's details. Validation is the same code the server runs. The success state
 * appears only after the server confirms delivery; every failure keeps what was typed and offers
 * the email address directly.
 */
export function ContactForm({ email }: ContactFormProps) {
  const base = useId();
  const id = (field: ContactField) => `${base}-${field}`;
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState<string>("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (status === "sent") confirmationRef.current?.focus();
  }, [status]);

  // A topic picked before the page finished loading (or restored by the browser on Back) is
  // checked without React hearing about it; pick it up once, so its details appear.
  useEffect(() => {
    const checked = formRef.current?.querySelector<HTMLInputElement>('input[name="topic"]:checked');
    if (checked) setTopic(checked.value);
  }, []);

  function focusFirstError(found: ContactErrors) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = validateContact(data);
    if (!result.ok) {
      setErrors(result.errors);
      setFailure(null);
      focusFirstError(result.errors);
      return;
    }
    setErrors({});
    setFailure(null);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.value, [TRAP_FIELD]: data[TRAP_FIELD] ?? "" }),
      });
      if (response.ok) {
        setSentTo({ name: result.value.name, email: result.value.email });
        setStatus("sent");
        return;
      }
      if (response.status === 422) {
        const body: { errors?: ContactErrors } = await response.json().catch(() => ({}));
        if (body.errors) {
          setErrors(body.errors);
          setStatus("idle");
          focusFirstError(body.errors);
          return;
        }
      }
      setFailure(messageFor(response.status));
    } catch {
      setFailure("The connection failed and your message was not sent.");
      // The server never saw this one, so the browser tells the owner's dashboard.
      sendSignal(
        "form_error",
        location.pathname,
        "The connection failed before the message reached the site",
      );
    }
    setStatus("failed");
  }

  if (status === "sent" && sentTo) {
    return (
      <div className="flex flex-col gap-6 border-t border-foreground pt-8" data-contact-sent>
        <h3
          ref={confirmationRef}
          tabIndex={-1}
          className="font-serif text-h2 font-medium text-foreground focus:outline-none"
        >
          Message sent.
        </h3>
        <p role="status" className="max-w-reading text-lead text-muted">
          Thank you{sentTo.name ? `, ${sentTo.name}` : ""}. I will reply to {sentTo.email}.
        </p>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              setSentTo(null);
              setTopic("");
              setStatus("idle");
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  const sending = status === "sending";
  const describe = (field: ContactField) => (errors[field] ? `${id(field)}-error` : undefined);
  const error = (field: ContactField) =>
    errors[field] ? (
      <p id={`${id(field)}-error`} className="text-small text-accent">
        {errors[field]}
      </p>
    ) : null;

  /** A row of pill-shaped radio buttons under one legend. */
  const choices = (
    field: ContactField,
    legend: ReactNode,
    options: readonly Option[],
    extra: { required?: boolean; onChange?: (value: string) => void } = {},
  ) => (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={describe(field)}
      data-contact-choices={field}
    >
      <legend className={`${labelClass} mb-3`}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={field}
              value={option.value}
              // Required is set on the radios, where assistive technology announces it; a
              // fieldset (role group) does not support aria-required. The form validates itself.
              required={extra.required}
              className="peer sr-only"
              onChange={extra.onChange ? () => extra.onChange?.(option.value) : undefined}
            />
            <span className={pillClass}>{option.label}</span>
          </label>
        ))}
      </div>
      {error(field)}
    </fieldset>
  );

  const select = (field: ContactField, label: string, options: readonly Option[]) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id(field)} className={labelClass}>
        {label} <Optional />
      </label>
      <select
        id={id(field)}
        name={field}
        defaultValue=""
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={describe(field)}
        className={`${fieldClass} cursor-pointer`}
      >
        <option value="">Choose…</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error(field)}
    </div>
  );

  const input = (
    field: ContactField,
    label: ReactNode,
    attributes: InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id(field)} className={labelClass}>
        {label}
      </label>
      <input
        id={id(field)}
        name={field}
        type="text"
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={describe(field)}
        className={fieldClass}
        {...attributes}
      />
      {error(field)}
    </div>
  );

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-8"
      data-contact-form
    >
      {choices("topic", "Reaching out about", CONTACT_TOPICS, {
        required: true,
        onChange: setTopic,
      })}
      <div className="grid gap-8 md:grid-cols-2">
        {input(
          "name",
          <>
            Name <Optional />
          </>,
          { autoComplete: "name", maxLength: CONTACT_LIMITS.name },
        )}
        {input("email", "Email", {
          type: "email",
          autoComplete: "email",
          required: true,
          "aria-required": true,
        })}
      </div>
      {topic === "project" ? (
        <div className="flex flex-col gap-8" data-contact-details="project">
          {choices(
            "projectKind",
            <>
              Kind of project <Optional />
            </>,
            PROJECT_KINDS,
          )}
          <div className="grid gap-8 md:grid-cols-2">
            {select("budget", "Budget", PROJECT_BUDGETS)}
            {select("timeline", "Timeline", PROJECT_TIMELINES)}
          </div>
        </div>
      ) : null}
      {topic === "job" ? (
        <div className="grid gap-8 md:grid-cols-2" data-contact-details="job">
          {input(
            "company",
            <>
              Company <Optional />
            </>,
            { autoComplete: "organization", maxLength: CONTACT_LIMITS.company },
          )}
          {input(
            "role",
            <>
              Role <Optional />
            </>,
            { autoComplete: "organization-title", maxLength: CONTACT_LIMITS.role },
          )}
        </div>
      ) : null}
      <div className="grid gap-8 md:grid-cols-2">
        {input(
          "phone",
          <>
            Phone or WhatsApp <Optional />
          </>,
          {
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            maxLength: CONTACT_LIMITS.phone,
          },
        )}
        {input(
          "website",
          <>
            Website <Optional />
          </>,
          { inputMode: "url", autoComplete: "url", maxLength: CONTACT_LIMITS.website },
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={id("message")} className={labelClass}>
          {messageLabel(topic)}
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          required
          aria-required="true"
          maxLength={CONTACT_LIMITS.messageMax}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message")}
          className={`${fieldClass} resize-y`}
        />
        {error("message")}
      </div>
      {/* Hidden from people and assistive technology. Bots that fill every field reveal themselves. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Fax
          <input type="text" name={TRAP_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={sending} aria-disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </Button>
        <p role="status" aria-live="polite" className="text-small text-muted">
          {sending ? "Sending your message…" : ""}
        </p>
      </div>
      {failure ? (
        <div
          role="alert"
          data-contact-failure
          className="flex max-w-reading flex-col gap-2 border-l-2 border-accent pl-4 text-foreground"
        >
          <p>{failure}</p>
          {email ? (
            <p className="text-muted">
              You can email me directly at{" "}
              <a href={`mailto:${email}`} className="text-accent underline underline-offset-4">
                {email}
              </a>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
