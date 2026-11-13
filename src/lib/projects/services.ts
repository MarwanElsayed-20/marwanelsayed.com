import { productLabels, workOrder } from "@/content/projects/work-order";
import { servicesContent, type Service } from "@/content/site/services";
import { productProjects, projects } from "./repository";
import { buildWorkEntries } from "./work";

export const MIN_SERVICES = 3;
export const MAX_SERVICES = 6;
export const MIN_POINTS = 3;
export const MAX_POINTS = 6;
export const MIN_QUESTIONS = 2;
export const MAX_QUESTIONS = 5;

export type ResolvedService = Omit<Service, "seen"> & {
  /** "01", "02", ... in display order. */
  number: string;
  /** Its page: `/services/<id>`. */
  href: string;
  seen: { label: string; href: string }[];
};

/** Resolves the services against the project records, failing the build on anything missing. */
export function resolveServices(
  services: readonly Service[],
  slugs: ReadonlySet<string>,
  hrefs: ReadonlyMap<string, string>,
): ResolvedService[] {
  if (services.length < MIN_SERVICES || services.length > MAX_SERVICES)
    throw new Error(`Show ${MIN_SERVICES} to ${MAX_SERVICES} services, not ${services.length}`);
  const seen = new Set<string>();
  return services.map((service, index) => {
    if (seen.has(service.id)) throw new Error(`Duplicate service: ${service.id}`);
    seen.add(service.id);
    if (service.seen.length === 0) throw new Error(`Service ${service.id} shows no work`);
    const { points, faq } = service.page;
    if (points.length < MIN_POINTS || points.length > MAX_POINTS)
      throw new Error(
        `Service ${service.id} lists ${points.length} points, not ${MIN_POINTS} to ${MAX_POINTS}`,
      );
    if (faq.length < MIN_QUESTIONS || faq.length > MAX_QUESTIONS)
      throw new Error(
        `Service ${service.id} answers ${faq.length} questions, not ${MIN_QUESTIONS} to ${MAX_QUESTIONS}`,
      );
    return {
      ...service,
      number: String(index + 1).padStart(2, "0"),
      href: `/services/${service.id}`,
      seen: service.seen.map(({ label, project }) => {
        const href = hrefs.get(project);
        if (!slugs.has(project) || !href)
          throw new Error(`Service ${service.id} links to an unknown project: ${project}`);
        return { label, href };
      }),
    };
  });
}

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);

export const resolvedServices = resolveServices(
  servicesContent.services,
  new Set([...projects, ...productProjects].map((project) => project.slug)),
  new Map(entries.map((entry) => [entry.slug, entry.href])),
);
