import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { IllustrationFacts } from "./types";
/** Fonts eligible for reproduction. Extend only with owner-approved repository files and licences. */
export const REPOSITORY_FONTS: Record<string, { font: string; licence: string }> = {
  Inter: { font: "src/fonts/inter-roman.woff2", licence: "src/fonts/LICENSE-Inter-OFL.txt" },
};
/** Build-time validation. Reports every invalid fact; never throws for malformed input. */
export function validateFacts(facts: readonly IllustrationFacts[], root = process.cwd()): string[] {
  const errors: string[] = [];
  const layouts = new Set<string>();
  const slugs = new Set<string>();
  for (const factsEntry of facts) {
    if (!factsEntry || typeof factsEntry !== "object") {
      errors.push("facts: must be a facts record");
      continue;
    }
    const f = factsEntry;
    const fail = (field: string, message: string) =>
      errors.push(f.slug + ": " + field + ": " + message);
    const sourced = (value: unknown) => typeof value === "string" && value.trim().length > 0;
    if (!sourced(f.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug))
      fail("slug", "must be a project identifier");
    if (slugs.has(f.slug)) fail("slug", "must be unique");
    slugs.add(f.slug);
    if (!["illustration", "reconstruction"].includes(f.kind))
      fail("kind", "must be illustration or reconstruction");
    if (
      !f.method ||
      !sourced(f.method.reason) ||
      !Array.isArray(f.method.sources) ||
      !f.method.sources.length ||
      f.method.sources.some((s) => !sourced(s))
    )
      fail("method", "requires a reason and sources");
    if (
      !["orders-table", "erp-pos", "services-home", "catalog-grid", "analytics-tiles"].includes(
        f.layout,
      )
    )
      fail("layout", "unknown layout family");
    if (layouts.has(f.layout)) fail("layout", "must be unique across facts");
    layouts.add(f.layout);
    if (!sourced(f.screenName)) fail("screenName", "is required");
    if (f.sampleContent !== "bars-only") fail("sampleContent", "must be bars-only");
    if (!Array.isArray(f.texts) || !f.texts.length) fail("texts", "requires sourced text");
    else {
      f.texts.forEach((text, i) => {
        if (!text || !sourced(text.text)) {
          fail("texts[" + i + "]", "text is required");
          return;
        }
        if (!sourced(text.source))
          fail(
            "texts[" + i + "].source",
            /\d/.test(text.text) ? "digits require a sourced text" : "is required",
          );
        if (/screenshot|sample|illustration|reconstruction|mock/i.test(text.text))
          fail("texts[" + i + "]", "disclosure words must not be drawn");
        if (!["name", "nav", "heading"].includes(text.role))
          fail("texts[" + i + "].role", "unknown text role");
      });
      if (f.texts.filter((t) => t?.role === "name").length !== 1)
        fail("texts", "requires exactly one project name");
    }
    if (!Array.isArray(f.palette) || !f.palette.length) fail("palette", "requires sourced colours");
    else {
      f.palette.forEach((colour, i) => {
        if (!colour || typeof colour.hex !== "string" || !/^#[a-f0-9]{6}$/i.test(colour.hex))
          fail("palette[" + i + "].hex", "must be a six-digit hex colour");
        if (!colour || !sourced(colour.source)) fail("palette[" + i + "].source", "is required");
      });
      for (const role of ["accent", "ink", "surface"])
        if (!f.palette.some((c) => c?.role === role)) fail("palette", role + " colour is required");
    }
    if (!f.type || !sourced(f.type.family) || !sourced(f.type.source))
      fail("type", "requires a family and source");
    else if (!["reproduced", "not-reproduced"].includes(f.type.status))
      fail("type.status", "unknown reproduction status");
    else if (f.type.status === "reproduced") {
      const font = REPOSITORY_FONTS[f.type.family];
      if (
        !font ||
        !existsSync(resolve(root, font.font)) ||
        !existsSync(resolve(root, font.licence))
      )
        fail("type.status", "reproduced font requires repository font and licence files");
    }
  }
  return errors;
}
