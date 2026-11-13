import type { AboutContent, ProfileLink } from "./types";

/**
 * Clearly synthetic content used only by the review pages under /design-system.
 * It describes no real person. Production code must never import this file.
 */
export const sampleAbout: AboutContent = {
  introduction: [
    "Sample introduction. This paragraph exists only to review the About layout and describes no real person.",
    "Sample second paragraph. It shows how a longer introduction wraps across lines in the reading column and contains no real information.",
  ],
  approach: ["Sample approach paragraph. It is review text only and states no real method."],
  background: ["Sample background paragraph. It is review text only and states no real history."],
};

export const sampleContact: {
  readonly email: string;
  readonly profiles: readonly ProfileLink[];
} = {
  email: "sample@sample-contact.invalid",
  profiles: [
    { label: "Sample profile one", url: "https://profile-one.invalid/sample" },
    { label: "Sample profile two", url: "https://profile-two.invalid/sample" },
  ],
};
