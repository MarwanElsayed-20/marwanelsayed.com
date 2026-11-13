import { families } from "./families";

/** The home showcase order. Add every new production project here. */
export const workOrder = [
  "toolswift-customer-dashboard",
  "toolswift-admin-platform",
  "toolswift-marketing",
  "wajihni",
  "smooth-erp",
  "smooth-erp-landing-pages",
  "hemex-dashboards",
  "hemex-landing-page",
  "aligna",
  "camufacturing-dashboard",
  "camufacturing-site",
  "falcon-translation-dashboard",
  "falcons-gt-motors",
  "falconsgt-sml",
  "falconsgt-luxury",
  "home-central-stores",
  "slack-lumber",
  "one-lax",
  "lumber-cart",
  "mdr-electrical-supply",
  "hamilton-pharmacy",
  "expat-shop",
  "filterco",
  "balcon-studio",
  // The compact rows (`compactWork`) come last in their area.
  "commissioners-pharmacy",
  "amherst-supply",
  "great-north-rc",
  "rd-electrical-supply",
] as const;

/**
 * Stores shown as short rows under "More online stores" on /work: each
 * repeats a featured store's kind (a second pharmacy, building-supply and electrical store), so the
 * strongest seven stay full rows and these stay one click away. They must be last in their area.
 */
export const compactWork: readonly string[] = [
  "commissioners-pharmacy",
  "amherst-supply",
  "great-north-rc",
  "rd-electrical-supply",
];

export const productLabels: Readonly<Record<string, string>> = Object.fromEntries(
  families.flatMap((family) => family.members.map((member) => [member.slug, family.name])),
);
