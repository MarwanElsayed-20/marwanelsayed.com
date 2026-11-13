import process from "node:process";
import { expectedPublicPaths, htmlMetadata, legacyRedirects } from "../../src/lib/share/site-check";

/** Requests stay on the supplied host, including image and redirect checks. No local file reads. */
async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const base = new URL(args.find((arg) => !arg.startsWith("--")) ?? "http://127.0.0.1:3000");
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.pathname !== "/" ||
    base.search ||
    base.hash
  )
    throw new Error("Base address must be an HTTP(S) origin without credentials.");
  const failures: string[] = [];
  const check = (ok: boolean, message: string) => {
    if (!ok) failures.push(message);
  };
  const get = (path: string) => {
    const target = new URL(path, base);
    if (target.origin !== base.origin)
      throw new Error("Check requests must stay on the supplied origin");
    return fetch(target, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  };
  const homeResponse = await get("/");
  const home = htmlMetadata(await homeResponse.text());
  const robotsResponse = await get("/robots.txt");
  const robots = await robotsResponse.text();
  const preview = args.includes("--preview") || /^Disallow:\s*\/\s*$/im.test(robots);
  const canonical = home.values("canonical")[0];
  const origin = canonical ? new URL(canonical).origin : null;
  check(!preview || !canonical, "Preview home must omit canonical");
  check(robotsResponse.ok, "robots.txt must return 200");
  check(
    preview ? /^Disallow:\s*\/\s*$/im.test(robots) : /^Allow:\s*\/\s*$/im.test(robots),
    "robots crawl policy mismatch",
  );
  const sitemapResponse = await get("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(sitemapResponse.ok, "sitemap must return 200");
  const expected =
    origin && !preview ? expectedPublicPaths().map((path) => `${origin}${path}`) : [];
  check(
    JSON.stringify([...entries].sort()) === JSON.stringify([...expected].sort()),
    "Sitemap membership/host mismatch (every public page when configured, empty when unset/preview)",
  );
  check(
    origin && !preview
      ? robots.includes(`Sitemap: ${origin}/sitemap.xml`)
      : !/^Sitemap:/im.test(robots),
    "robots sitemap address mismatch",
  );
  for (const { from, to } of legacyRedirects()) {
    for (const suffix of ["", "/"]) {
      const response = await get(`${from}${suffix}?launch=016`);
      const location = response.headers.get("location");
      const target = location ? new URL(location, base) : null;
      const destination = new URL(to, base);
      check(
        [301, 308].includes(response.status) &&
          target?.origin === base.origin &&
          target.pathname === destination.pathname &&
          target.hash === destination.hash &&
          target.searchParams.get("launch") === "016",
        `${from}${suffix}: expected one permanent hop preserving query to ${to}`,
      );
      if (target?.origin === base.origin)
        check(
          (await get(target.pathname + target.search)).status === 200,
          `${from}: destination is not 200 in one hop`,
        );
    }
  }
  const titles = new Set<string>(),
    descriptions = new Set<string>();
  for (const path of expectedPublicPaths()) {
    const response = await get(path);
    const meta = htmlMetadata(await response.text());
    check(response.status === 200, `${path}: status ${response.status}`);
    const description = meta.values("description");
    check(!!meta.title && !titles.has(meta.title), `${path}: missing/duplicate title`);
    check(
      description.length === 1 && !!description[0] && !descriptions.has(description[0]),
      `${path}: missing/duplicate description`,
    );
    titles.add(meta.title);
    descriptions.add(description[0]);
    for (const key of ["og:description", "twitter:description"])
      check(
        meta.values(key).length === 1 && meta.values(key)[0] === description[0],
        `${path}: ${key} mismatch`,
      );
    check(
      meta.values("og:title").length === 1 &&
        meta.values("twitter:title")[0] === meta.values("og:title")[0],
      `${path}: share titles mismatch`,
    );
    const canonicals = meta.values("canonical");
    check(
      origin && !preview
        ? canonicals.length === 1 && canonicals[0] === `${origin}${path}`
        : canonicals.length === 0,
      `${path}: canonical mismatch`,
    );
    check(
      origin && !preview
        ? meta.values("og:url")[0] === `${origin}${path}`
        : meta.values("og:url").length === 0,
      `${path}: og:url mismatch`,
    );
    if (preview)
      check(
        meta.values("robots").some((value) => /noindex/.test(value)),
        `${path}: preview must be noindex`,
      );
    check(meta.values("twitter:card")[0] === "summary_large_image", `${path}: Twitter card type`);
    for (const key of ["og:image", "twitter:image"]) {
      const images = meta.values(key);
      check(images.length === 1, `${path}: expected exactly one ${key}`);
      if (images.length !== 1) continue;
      const image = new URL(images[0], base);
      if (origin) check(image.origin === origin, `${path}: ${key} host mismatch`);
      else
        check(
          image.origin === base.origin || image.hostname === "localhost",
          `${path}: ${key} unexpected unset/preview host`,
        );
      const result = await get(image.pathname + image.search);
      check(
        result.status === 200 && /^image\//.test(result.headers.get("content-type") ?? ""),
        `${path}: ${key} not a resolving image`,
      );
      const buffer = Buffer.from(await result.arrayBuffer());
      check(
        buffer.length >= 24 &&
          buffer.subarray(1, 4).toString() === "PNG" &&
          buffer.readUInt32BE(16) === 1200 &&
          buffer.readUInt32BE(20) === 630,
        `${path}: ${key} dimensions`,
      );
      check(
        meta.values(`${key}:alt`)[0] === meta.values("og:title")[0],
        `${path}: ${key} alt mismatch`,
      );
    }
  }
  for (const path of ["/contact", "/design-system", "/design-system/about"]) {
    const response = await get(path);
    if (path === "/contact") check(response.status === 404, `${path}: expected 404`);
    const meta = htmlMetadata(await response.text());
    check(
      meta.values("og:image").length === 0 && meta.values("twitter:image").length === 0,
      `${path}: must not advertise images`,
    );
  }
  for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
  process.stdout.write(
    `${base.origin}: ${failures.length ? `${failures.length} failures` : `PASS: redirects, 404s, ${expectedPublicPaths().length} pages, images, sitemap and robots`}; mode=${preview ? "preview" : origin ? "configured" : "unset address"}\n`,
  );
  return failures.length ? 1 : 0;
}
main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    process.stderr.write(`FAIL ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
