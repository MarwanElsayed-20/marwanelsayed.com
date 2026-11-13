/** Project slugs presented as Selected Work on the home page, in display order (3 to 6; the resolver in lib/projects/featured-work.ts rejects anything else). Holds identifiers only; titles, summaries, images and categories come from the project records. The order is not a ranking. Each slug is the first case study of its Selected work scene (src/content/site/selected-work.ts); a test keeps the two in step. */
export const featuredProjectSlugs: readonly string[] = [
  "toolswift-customer-dashboard",
  "smooth-erp",
  "aligna",
  "wajihni",
];
