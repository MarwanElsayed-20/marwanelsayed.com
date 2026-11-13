import { digitalExperiences, digitalProducts } from "./projects";

type PermanentRedirect = { source: string; destination: string; permanent: true };

/** Project addresses whose slug was corrected; the old address keeps working in one hop. */
const slugRenames = [{ section: digitalProducts, from: "wajhni", to: "wajihni" }] as const;

/** Exact roots precede legacy nested paths, keeping every redirect to one hop. */
export const sectionRedirects: PermanentRedirect[] = [
  ...slugRenames.flatMap(({ section, from, to }) => [
    {
      source: `${section.basePath}/${from}`,
      destination: `${section.basePath}/${to}`,
      permanent: true as const,
    },
    {
      source: `/${section.id}/${from}`,
      destination: `${section.basePath}/${to}`,
      permanent: true as const,
    },
  ]),
  ...[digitalExperiences, digitalProducts].flatMap((section) => [
    { source: section.basePath, destination: "/work", permanent: true as const },
    { source: `/${section.id}`, destination: "/work", permanent: true as const },
    {
      source: `/${section.id}/:path*`,
      destination: `${section.basePath}/:path*`,
      permanent: true as const,
    },
  ]),
];
