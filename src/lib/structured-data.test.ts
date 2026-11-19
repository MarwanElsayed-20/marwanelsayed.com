import { describe, expect, it } from "vitest";
import { digitalExperiences, digitalProducts } from "@/config/projects";
import { productProjects, projects } from "@/lib/projects/repository";
import { projectPath } from "@/lib/projects/select";
import { resolvedServices } from "@/lib/projects/services";
import {
  aboutStructuredData,
  caseStudyStructuredData,
  homeStructuredData,
  serializeJsonLd,
  serviceStructuredData,
} from "./structured-data";

const live = { SITE_URL: "https://example.com", VERCEL_ENV: "production" };
type Node = Record<string, unknown>;
const nodes = (data: { "@graph": Node[] } | null) => data?.["@graph"] ?? [];
const ofType = (data: { "@graph": Node[] } | null, type: string) =>
  nodes(data).find((node) => node["@type"] === type);

/** Every absolute address in the data, wherever it sits. */
function urls(value: unknown): string[] {
  if (typeof value === "string") return /^https?:\/\//.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(urls);
  if (value && typeof value === "object") return Object.values(value).flatMap(urls);
  return [];
}

describe("structured data", () => {
  it("is not produced without a public site origin (previews and local builds)", () => {
    expect(homeStructuredData({})).toBeNull();
    expect(
      aboutStructuredData({ SITE_URL: "https://example.com", VERCEL_ENV: "preview" }),
    ).toBeNull();
    expect(
      caseStudyStructuredData(projects[0]!, "/x", { SITE_URL: "http://example.com" }),
    ).toBeNull();
  });

  it("describes the site and the person on the home page, linked to the public profiles", () => {
    const data = homeStructuredData(live);
    expect(data?.["@context"]).toBe("https://schema.org");
    const site = ofType(data, "WebSite")!;
    const person = ofType(data, "Person")!;
    expect(site.url).toBe("https://example.com/");
    expect(site.author).toEqual({ "@id": person["@id"] });
    expect(person.name).toBe("Marwan Elsayed");
    expect(person.jobTitle).toBe("Front-end engineer");
    expect(person.sameAs).toEqual(
      expect.arrayContaining([
        expect.stringContaining("github.com"),
        expect.stringContaining("linkedin.com"),
      ]),
    );
    expect(person.email).toBe("mailto:hello@marwanelsayed.com");
    expect((person.knowsAbout as string[]).length).toBeGreaterThan(3);
    // The employer is named on /about only.
    expect(person.worksFor).toBeUndefined();
  });

  it("names the share card as the home page's main image", () => {
    const data = homeStructuredData(live);
    const page = ofType(data, "WebPage")!;
    expect(page.url).toBe("https://example.com/");
    expect(page.isPartOf).toEqual({ "@id": ofType(data, "WebSite")!["@id"] });
    expect(page.about).toEqual({ "@id": ofType(data, "Person")!["@id"] });
    expect(page.primaryImageOfPage).toEqual({
      "@type": "ImageObject",
      url: "https://example.com/opengraph-image",
      width: 1200,
      height: 630,
    });
  });

  it("makes /about a profile page about the person, with the current employer", () => {
    const data = aboutStructuredData(live);
    const page = ofType(data, "ProfilePage")!;
    const person = page.mainEntity as Node;
    expect(page.url).toBe("https://example.com/about");
    expect(person["@type"]).toBe("Person");
    expect(person["@id"]).toBe("https://example.com/#person");
    expect(person.worksFor).toEqual({ "@type": "Organization", name: "Webelocity" });
    expect(String(person.image)).toMatch(/^https:\/\/example\.com\/about\/.+\.webp$/);
  });

  it("describes every case study as a work by the person, with a Home > Work > title breadcrumb", () => {
    const all = [
      ...projects.map((p) => [p, projectPath(digitalExperiences.basePath, p.slug)] as const),
      ...productProjects.map((p) => [p, projectPath(digitalProducts.basePath, p.slug)] as const),
    ];
    expect(all.length).toBeGreaterThan(20);
    for (const [project, path] of all) {
      const data = caseStudyStructuredData(project, path, live)!;
      const work = ofType(data, "CreativeWork")!;
      expect(work.name).toBe(project.title);
      expect(work.url).toBe(`https://example.com${path}`);
      expect(work.creator).toEqual({ "@id": "https://example.com/#person" });
      const crumbs = ofType(data, "BreadcrumbList")!.itemListElement as Node[];
      expect(crumbs.map((c) => c.name)).toEqual(["Home", "Work", project.title]);
      expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
      for (const url of urls(data["@graph"]))
        expect(url, project.slug).toMatch(/^https:\/\/example\.com\//);
    }
  });

  it("describes every service page as a service offered by the person", () => {
    for (const service of resolvedServices) {
      const data = serviceStructuredData(
        { title: service.page.title, description: service.page.description, path: service.href },
        live,
      );
      const node = ofType(data, "Service")!;
      expect(node.url).toBe(`https://example.com${service.href}`);
      expect(node.provider).toEqual({ "@id": "https://example.com/#person" });
      const crumbs = ofType(data, "BreadcrumbList")!.itemListElement as Node[];
      expect(crumbs.map((c) => c.name)).toEqual(["Home", "Services", service.page.title]);
    }
  });

  it("serializes so text in the data can never close the script element", () => {
    const json = serializeJsonLd({
      "@context": "https://schema.org",
      "@graph": [{ name: "</script><b>" }],
    });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)["@graph"][0].name).toBe("</script><b>");
  });
});

describe("search snippets", () => {
  it("keeps every case-study description within 160 characters, so search results show it whole", () => {
    for (const project of [...projects, ...productProjects]) {
      expect(project.summary.length, project.slug).toBeLessThanOrEqual(160);
    }
  });

  it("keeps every service page's search title within 60 characters with the site name", () => {
    for (const service of resolvedServices) {
      const title = `${service.page.metaTitle ?? service.page.title} | Marwan Elsayed`;
      expect(title.length, service.id).toBeLessThanOrEqual(60);
    }
  });
});
