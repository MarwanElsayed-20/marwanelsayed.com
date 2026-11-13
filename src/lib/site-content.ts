import { aboutContent } from "@/content/site/about";
import { contactDetails } from "@/content/site/contact";
import { homeContent } from "@/content/site/home";
import { siteName } from "@/content/site/identity";
import {
  assertValidSiteContent,
  isAboutSupplied,
  isContactSupplied,
} from "@/lib/site/content-rules";

/**
 * The owner-supplied site content, validated once. A malformed value fails the build and names
 * the record and field. A missing value is valid: it means "not supplied".
 */
export const siteContent = assertValidSiteContent({
  siteName,
  home: homeContent,
  about: aboutContent,
  contact: contactDetails,
});

export const aboutSupplied = isAboutSupplied(siteContent.about);
export const contactSupplied = isContactSupplied(siteContent.contact);
export const siteNameSupplied = siteContent.siteName !== null;
