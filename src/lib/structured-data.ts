import { categories } from "@/config/projects";
import { aboutContent, aboutPage } from "@/content/site/about";
import { footerPlace } from "@/content/site/contact";
import { homeContent } from "@/content/site/home";
import type { BaseProject } from "@/lib/projects/types";
import { productProjects, projects } from "@/lib/projects/repository";
import { topTechnologies } from "@/lib/projects/technologies";
import { siteContent } from "@/lib/site-content";
import { siteOrigin } from "@/lib/site/site-origin";

/**
 * Structured data (schema.org JSON-LD) that tells search engines who the site is about and what
 * each page is: the person and the site on the home page, a profile page on /about, and a
 * breadcrumb with the work or service on the inner pages.
 *
 * Every address is absolute, so nothing is produced without a public site origin (SITE_URL on
 * production): previews and local builds publish no structured data rather than wrong addresses.
 */

type Node = Record<string, unknown>;
type Graph = { "@context": "https://schema.org"; "@graph": Node[] };
type Env = Parameters<typeof siteOrigin>[0];

const graph = (nodes: Node[]): Graph => ({ "@context": "https://schema.org", "@graph": nodes });

const personId = (origin: string) => `${origin}/#person`;
const websiteId = (origin: string) => `${origin}/#website`;

/** The person behind the site. `full` adds the details that belong on the profile and home pages. */
function person(origin: string, full: boolean, employer: boolean): Node {
  const name = siteContent.siteName ?? "Portfolio";
  const base: Node = { "@type": "Person", "@id": personId(origin), name, url: `${origin}/` };
  if (!full) return base;
  const { email, profiles } = siteContent.contact;
  const current = aboutContent.experience?.find((role) => /present/i.test(role.period ?? ""));
  return {
    ...base,
    jobTitle: homeContent.headline,
    description: homeContent.introduction ?? undefined,
    image: `${origin}${aboutPage.portrait.src}`,
    ...(email ? { email: `mailto:${email}` } : {}),
    homeLocation: { "@type": "Place", name: footerPlace.label },
    sameAs: profiles.map((profile) => profile.url),
    knowsAbout: topTechnologies(
      [...projects, ...productProjects],
      12,
      aboutPage.approach.toolsLeftOut,
    ).map((technology) => technology.name),
    ...(employer && current?.place && !/freelance/i.test(current.place)
      ? { worksFor: { "@type": "Organization", name: current.place } }
      : {}),
  };
}

function website(origin: string): Node {
  return {
    "@type": "WebSite",
    "@id": websiteId(origin),
    url: `${origin}/`,
    name: siteContent.siteName ?? "Portfolio",
    inLanguage: "en",
    author: { "@id": personId(origin) },
  };
}

function breadcrumb(origin: string, trail: readonly { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${origin}${step.path === "/" ? "/" : step.path}`,
    })),
  };
}

/**
 * The home page itself, naming the share card (the generated /opengraph-image) as its main image,
 * so search engines prefer it to a project screenshot when they show a thumbnail for the site.
 * The address carries no build hash: the route serves the current card either way.
 */
function homePage(origin: string): Node {
  return {
    "@type": "WebPage",
    "@id": `${origin}/#webpage`,
    url: `${origin}/`,
    name: siteContent.siteName ?? "Portfolio",
    isPartOf: { "@id": websiteId(origin) },
    about: { "@id": personId(origin) },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${origin}/opengraph-image`,
      width: 1200,
      height: 630,
    },
  };
}

/** Home: the site, the page, and the person they belong to. */
export function homeStructuredData(env: Env = process.env): Graph | null {
  const origin = siteOrigin(env);
  if (origin === null) return null;
  return graph([website(origin), homePage(origin), person(origin, true, false)]);
}

/** /about: a profile page whose subject is the person, with the current employer. */
export function aboutStructuredData(env: Env = process.env): Graph | null {
  const origin = siteOrigin(env);
  if (origin === null) return null;
  return graph([
    {
      "@type": "ProfilePage",
      "@id": `${origin}/about#page`,
      url: `${origin}/about`,
      name: `About ${siteContent.siteName ?? ""}`.trim(),
      isPartOf: { "@id": websiteId(origin) },
      mainEntity: person(origin, true, true),
    },
    breadcrumb(origin, [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ]);
}

/** A case study: the work itself, made by the person, and where it sits on the site. */
export function caseStudyStructuredData(
  project: BaseProject,
  path: string,
  env: Env = process.env,
): Graph | null {
  const origin = siteOrigin(env);
  if (origin === null) return null;
  const image = project.image?.src;
  return graph([
    {
      "@type": "CreativeWork",
      "@id": `${origin}${path}#work`,
      name: project.title,
      description: project.summary,
      url: `${origin}${path}`,
      ...(image ? { image: image.startsWith("http") ? image : `${origin}${image}` } : {}),
      ...(project.period ? { dateCreated: project.period } : {}),
      genre: categories[project.category].name,
      ...(project.builtWith?.length ? { keywords: project.builtWith.join(", ") } : {}),
      creator: { "@id": personId(origin) },
      isPartOf: { "@id": websiteId(origin) },
    },
    person(origin, false, false),
    breadcrumb(origin, [
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
      { name: project.title, path },
    ]),
  ]);
}

/** A service page: the service, offered by the person, and where it sits on the site. */
export function serviceStructuredData(
  service: { title: string; description: string; path: string },
  env: Env = process.env,
): Graph | null {
  const origin = siteOrigin(env);
  if (origin === null) return null;
  return graph([
    {
      "@type": "Service",
      "@id": `${origin}${service.path}#service`,
      name: service.title,
      description: service.description,
      url: `${origin}${service.path}`,
      provider: { "@id": personId(origin) },
    },
    person(origin, false, false),
    breadcrumb(origin, [
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.title, path: service.path },
    ]),
  ]);
}

/**
 * JSON for a `<script type="application/ld+json">`: `<` is escaped so no text in the data can
 * close the script element early.
 */
export function serializeJsonLd(data: Graph): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
