import { describe, expect, it } from "vitest";
import { servicesContent, servicesPage, type Service } from "@/content/site/services";
import { resolveServices, resolvedServices } from "./services";

const slugs = new Set(["a", "b"]);
const hrefs = new Map([
  ["a", "/saas-dashboards/a"],
  ["b", "/saas-dashboards/b"],
]);
const service = (id: string, overrides: Partial<Service> = {}) =>
  ({
    id,
    name: id,
    audience: "For someone.",
    includes: "Something.",
    seen: [{ label: "A", project: "a" }],
    page: {
      title: "T",
      description: "D",
      answer: "A.",
      points: ["one", "two", "three"],
      faq: [
        { question: "Q1?", answer: "A1." },
        { question: "Q2?", answer: "A2." },
      ],
    },
    ...overrides,
  }) as Service;

describe("resolveServices", () => {
  it("numbers services and resolves addresses and links", () => {
    const [first, , third] = resolveServices(
      [service("x"), service("y"), service("z")],
      slugs,
      hrefs,
    );
    expect(first.number).toBe("01");
    expect(third.number).toBe("03");
    expect(first.href).toBe("/services/x");
    expect(first.seen).toEqual([{ label: "A", href: "/saas-dashboards/a" }]);
  });

  it("rejects bad counts, duplicates, unknown projects and services that show no work", () => {
    expect(() => resolveServices([service("x"), service("y")], slugs, hrefs)).toThrow(/3 to 6/);
    expect(() => resolveServices([service("x"), service("x"), service("y")], slugs, hrefs)).toThrow(
      /Duplicate service: x/,
    );
    const unknown = service("z", { seen: [{ label: "N", project: "nope" }] });
    expect(() => resolveServices([service("x"), service("y"), unknown], slugs, hrefs)).toThrow(
      /unknown project: nope/,
    );
    const thin = service("z", { page: { ...service("z").page, points: ["one"] } });
    expect(() => resolveServices([service("x"), service("y"), thin], slugs, hrefs)).toThrow(
      /lists 1 points/,
    );
    const quiet = service("z", { page: { ...service("z").page, faq: [] } });
    expect(() => resolveServices([service("x"), service("y"), quiet], slugs, hrefs)).toThrow(
      /answers 0 questions/,
    );
    const empty = service("z", { seen: [] });
    expect(() => resolveServices([service("x"), service("y"), empty], slugs, hrefs)).toThrow(
      /shows no work/,
    );
  });
});

describe("the services content", () => {
  it("resolves against the real project records, in the approved order", () => {
    expect(resolvedServices.map((item) => item.id)).toEqual([
      "online-stores",
      "websites",
      "dashboards",
      "saas-erp",
    ]);
  });

  it("links every service to case studies on this site", () => {
    for (const item of resolvedServices)
      for (const work of item.seen)
        expect(work.href, work.label).toMatch(/^\/[a-z-]+\/[a-z0-9-]+$/);
  });

  it("gives every service the copy of its own page, from the records only", () => {
    for (const item of resolvedServices) {
      expect(item.page.title.length, item.id).toBeGreaterThan(10);
      expect(item.page.answer.length, item.id).toBeGreaterThan(80);
      expect(item.page.points.length, item.id).toBeGreaterThanOrEqual(3);
      expect(item.page.faq.length, item.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("names no employer, price or guarantee in any service or page copy", () => {
    const words = JSON.stringify([servicesContent, servicesPage]);
    expect(words).not.toMatch(/webelocity|fivem|freelanc/i);
    expect(words).not.toMatch(/\$|\bUSD\b|\bEGP\b|guarantee|within \d|in \d+ (days|weeks)/i);
    expect(words).not.toMatch(/\b(all|every) projects?\b|directory|index of/i);
  });

  it("sends the left column to contact and to the services page", () => {
    expect(servicesContent.action.href).toBe("/#contact");
    expect(servicesContent.all.href).toBe("/services");
  });
});
