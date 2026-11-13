/** A public profile link shown on the Contact page and in the footer. */
export type ProfileLink = {
  readonly label: string;
  readonly url: string;
};

/** Home-page content supplied by the owner. */
export type HomeContent = {
  readonly headline: string;
  /** One plain-text paragraph. `null` means not supplied. */
  readonly introduction: string | null;
  /** The statement of what the owner works on, shown above Selected work. Plain text. */
  readonly focus?: string;
  /** The button under the statement: where to read more about the owner. */
  readonly focusAction?: { readonly label: string; readonly href: string };
};

/** One role or course of study on the About page. Every field is plain text. */
export type ExperienceEntry = {
  /** The employer or school, shown above the role (About page only). */
  readonly place?: string;
  readonly role: string;
  /** Omitted for entries without a recorded date range. */
  readonly period?: string;
  readonly detail: string;
};

/** About-page content supplied by the owner. Each list holds plain-text paragraphs. */
export type AboutContent = {
  /** Optional. Shown as the experience timeline; omitted when empty or absent. */
  readonly experience?: readonly ExperienceEntry[];
  /** Required for the About page to count as supplied. Empty means not supplied. */
  readonly introduction: readonly string[];
  /** Optional. Empty means the section is omitted entirely. */
  readonly approach: readonly string[];
  /** Optional. Empty means the section is omitted entirely. */
  readonly background: readonly string[];
};

/** Contact details supplied by the owner. */
export type ContactDetails = {
  /** Required for the Contact page to count as supplied. `null` means not supplied. */
  readonly email: string | null;
  /** Optional public profile links. Empty means none. */
  readonly profiles: readonly ProfileLink[];
  /** Optional. A number used for WhatsApp only: digits, country code first, no plus sign. */
  readonly whatsapp?: string | null;
};
