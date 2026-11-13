import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { illustrationFacts } from "../../src/content/illustrations";
import { digitalExperiencesProjects } from "../../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../../src/content/projects/digital-products";
import { featuredProjectSlugs } from "../../src/content/projects/featured";
import { composeIllustration } from "../../src/lib/illustrations/compose";
import { CAPTION } from "../../src/lib/illustrations/labels";
import type { IllustrationFacts } from "../../src/lib/illustrations/types";
import { REPOSITORY_FONTS, validateFacts } from "../../src/lib/illustrations/validate-facts";
const root = process.cwd();
const manifestPath = resolve(root, "src/content/illustrations/hashes.json");
const fontFor = (facts: IllustrationFacts) =>
  REPOSITORY_FONTS[facts.type.status === "reproduced" ? facts.type.family : "Inter"];
async function inputHash(facts: IllustrationFacts): Promise<string> {
  const hash = createHash("sha256");
  for (const path of [
    "src/content/illustrations/" + facts.slug + ".ts",
    "src/lib/illustrations/layouts/" + facts.layout + ".ts",
    "src/lib/illustrations/compose.ts",
    fontFor(facts).font,
  ]) {
    const bytes = await readFile(resolve(root, path));
    hash.update(path).update("\0").update(bytes);
  }
  return hash.digest("hex");
}
async function manifest(): Promise<Record<string, string>> {
  if (!existsSync(manifestPath)) return {};
  const data: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.values(data).some((v) => typeof v !== "string")
  )
    throw new Error("Invalid illustration hashes manifest");
  return data as Record<string, string>;
}
async function check(selected: readonly IllustrationFacts[]): Promise<number> {
  const hashes = await manifest();
  const errors: string[] = [];
  for (const facts of selected) {
    const slug = facts.slug;
    if (hashes[slug] !== (await inputHash(facts)))
      errors.push(slug + ": stale or missing input hash; run pnpm illustrations:build " + slug);
    const path = resolve(root, "public/projects/" + slug + "/card.png");
    if (!existsSync(path)) errors.push(slug + ": missing card.png");
    else {
      const png = await readFile(path);
      const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      if (png.length < 24 || !png.subarray(0, 8).equals(signature))
        errors.push(slug + ": invalid PNG");
      else {
        const width = png.readUInt32BE(16),
          height = png.readUInt32BE(20);
        if (width !== 1600 || height !== 1000 || width / height !== 16 / 10)
          errors.push(slug + ": PNG must be 1600 by 1000 (16:10)");
        process.stdout.write(slug + ": " + png.length + " PNG bytes\n");
      }
    }
    const project = [...digitalExperiencesProjects, ...digitalProductsProjects].find(
      (p) => p.slug === slug,
    );
    const image = project?.image;
    if (!image || image.kind !== facts.kind)
      errors.push(slug + ": project image.kind does not match facts");
    if (!image?.alt?.toLowerCase().includes(facts.kind) || image.alt.length > 200)
      errors.push(slug + ": project image.alt must describe its kind within 200 characters");
    if (image?.caption !== CAPTION[facts.kind])
      errors.push(slug + ": project image.caption does not match the disclosure");
    if (
      image?.width !== 1600 ||
      image.height !== 1000 ||
      image.src !== "/projects/" + slug + "/card.png"
    )
      errors.push(slug + ": project image path or dimensions do not match");
  }
  if (errors.length) {
    process.stderr.write(errors.join("\n") + "\n");
    return 1;
  }
  process.stdout.write("All selected illustration inputs and records are current.\n");
  return 0;
}
async function build(selected: readonly IllustrationFacts[]): Promise<number> {
  if (!existsSync(chromium.executablePath())) {
    process.stderr.write(
      "Chromium is missing. Install it explicitly with pnpm exec playwright install chromium.\n",
    );
    return 2;
  }
  const hashes = await manifest();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      offline: true,
      reducedMotion: "reduce",
    });
    await context.route("**/*", (route) => route.abort());
    for (const facts of selected) {
      const font = fontFor(facts);
      if (!font || !existsSync(resolve(root, font.licence)))
        throw new Error(facts.slug + ": missing font licence");
      const bytes = await readFile(resolve(root, font.font));
      const family = facts.type.status === "reproduced" ? facts.type.family : "Inter";
      const { html } = composeIllustration(facts);
      const page = await context.newPage();
      await page.setContent(html);
      await page.addStyleTag({
        content:
          '@font-face{font-family:"' +
          family +
          '";src:url(data:font/woff2;base64,' +
          bytes.toString("base64") +
          ");font-weight:100 900;font-style:normal;}",
      });
      await page.evaluate("document.fonts.ready");
      const clipped = await page.locator("[data-text]").evaluateAll((elements) =>
        elements.some((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.left < 0 ||
            r.top < 0 ||
            r.right > 1600 ||
            r.bottom > 1000 ||
            el.scrollWidth > el.clientWidth
          );
        }),
      );
      if (clipped) throw new Error(facts.slug + ": drawn text is clipped; fix the layout");
      const target = resolve(root, "public/projects/" + facts.slug + "/card.png");
      await mkdir(dirname(target), { recursive: true });
      await page.screenshot({ path: target, type: "png" });
      await page.close();
      hashes[facts.slug] = await inputHash(facts);
      process.stdout.write("Built " + facts.slug + " (" + facts.kind + ")\n");
    }
    await context.close();
  } finally {
    await browser.close();
  }
  await writeFile(manifestPath, JSON.stringify(hashes, null, 2) + "\n");
  return 0;
}
async function main(): Promise<number> {
  const [command, slug, ...extra] = process.argv.slice(2);
  if (!["build", "check"].includes(command) || extra.length) {
    process.stderr.write("Usage: illustrations <build|check> [slug]\n");
    return 2;
  }
  const errors = validateFacts(illustrationFacts, root);
  for (const facts of illustrationFacts)
    if (!featuredProjectSlugs.includes(facts.slug))
      errors.push(facts.slug + ": not in featured projects");
  if (errors.length) {
    process.stderr.write(errors.join("\n") + "\n");
    return 1;
  }
  const selected = slug ? illustrationFacts.filter((f) => f.slug === slug) : illustrationFacts;
  if (!selected.length) {
    if (slug) {
      process.stderr.write("Unknown illustration slug: " + slug + "\n");
      return 1;
    }
    process.stdout.write("No active illustration inputs; nothing to " + command + ".\n");
    return 0;
  }
  return command === "build" ? build(selected) : check(selected);
}
main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    process.stderr.write(
      "Illustration tool failure: " +
        (error instanceof Error ? error.message : String(error)) +
        "\n",
    );
    process.exitCode = 2;
  });
