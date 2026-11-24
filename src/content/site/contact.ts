import type { ContactDetails } from "./types";

/**
 * Public email and profiles.
 * Profile addresses use HTTPS.
 */
export const contactDetails: ContactDetails = {
  email: "marwan@marwanelsayed.com",
  profiles: [
    { label: "GitHub", url: "https://github.com/MarwanElsayed-20" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/marwanellsayed" },
  ],
  // For WhatsApp only: it is never shown as a phone number or linked as tel:.
  whatsapp: "201114766628",
};

/**
 * The invitation above the contact form: an invitation only, no claims.
 */
export const contactCta = {
  heading: "Let's build your next project together.",
  line: "Tell me what you need and I'll reply by email.",
} as const;

/** The site's own code, public on GitHub, linked beside the copyright in the footer. */
export const siteSource = {
  label: "Source code",
  url: "https://github.com/MarwanElsayed-20/marwanelsayed.com",
} as const;

/**
 * Where I am based, shown in the footer with the time there.
 * Availability is not shown.
 */
export const footerPlace = {
  label: "Cairo, Egypt",
  timeZone: "Africa/Cairo",
} as const;
