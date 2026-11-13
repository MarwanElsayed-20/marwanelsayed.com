import { digitalExperiencesProjects } from "../../content/projects/digital-experiences";
import { digitalProductsProjects } from "../../content/projects/digital-products";

export function expectedPublicPaths() {
  return [
    "/",
    "/work",
    "/about",
    ...digitalExperiencesProjects.map((p) => `/websites-ecommerce/${p.slug}`),
    ...digitalProductsProjects.map((p) => `/saas-dashboards/${p.slug}`),
  ];
}

export function legacyRedirects() {
  return [
    { from: "/digital-experiences", to: "/work" },
    { from: "/digital-products", to: "/work" },
    ...digitalExperiencesProjects.map((p) => ({
      from: `/digital-experiences/${p.slug}`,
      to: `/websites-ecommerce/${p.slug}`,
    })),
    ...digitalProductsProjects.map((p) => ({
      from: `/digital-products/${p.slug}`,
      to: `/saas-dashboards/${p.slug}`,
    })),
  ];
}

export function decodeHtml(value: string) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#39|#x27|#\d+);/g, (entity) => {
    const known: Record<string, string> = {
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&#39;": "'",
      "&#x27;": "'",
      "&lt;": "<",
      "&gt;": ">",
    };
    return known[entity] ?? String.fromCharCode(Number(entity.slice(2, -1)));
  });
}

/** Read metadata only, never script strings containing serialized duplicate markup. */
export function htmlMetadata(html: string) {
  const clean = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const tags = [...clean.matchAll(/<(meta|link)\s+([^>]+)>/gi)].map((match) => {
    const attributes = Object.fromEntries(
      [...match[2].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map((m) => [m[1], decodeHtml(m[2])]),
    );
    return attributes;
  });
  return {
    title: decodeHtml(clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    values: (key: string) =>
      tags
        .filter((tag) => tag.name === key || tag.property === key || tag.rel === key)
        .map((tag) => tag.content ?? tag.href ?? ""),
  };
}
