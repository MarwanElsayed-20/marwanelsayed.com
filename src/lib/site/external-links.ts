export type ExternalLink = {
  readonly url: string;
  /** Where the link comes from, for example `Contact: Profile one`. */
  readonly source: string;
};

type WithLiveLink = {
  readonly slug: string;
  readonly liveLink?: { readonly url: string };
};

type CollectInput = {
  readonly profiles: readonly { readonly label: string; readonly url: string }[];
  readonly digitalExperiences: readonly WithLiveLink[];
  readonly digitalProducts: readonly WithLiveLink[];
};

/** Every external address the site links to, once each, in a stable order. */
export function collectExternalLinks(input: CollectInput): ExternalLink[] {
  const seen = new Set<string>();
  const links: ExternalLink[] = [];
  const add = (url: string, source: string) => {
    if (seen.has(url)) return;
    seen.add(url);
    links.push({ url, source });
  };
  for (const profile of input.profiles) add(profile.url, `Contact: ${profile.label}`);
  for (const project of input.digitalExperiences) {
    if (project.liveLink) add(project.liveLink.url, `Websites & E-commerce: ${project.slug}`);
  }
  for (const project of input.digitalProducts) {
    if (project.liveLink) add(project.liveLink.url, `SaaS & Dashboards: ${project.slug}`);
  }
  return links;
}
