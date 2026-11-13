// Renders the Selected work artwork offline: one object per scene.
// Each scene in ./scenes is a three.js page rendered in headless Chromium (software WebGL),
// averaging many jittered frames for clean edges and soft shadows. Output is WebP in
// public/selected-work/, plus a manifest of their sizes that the components import.
//
// Usage: node scripts/artwork/run.mjs [bolt|receipt|aligner|badge ...] [--quick]
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = fileURLToPath(new URL(".", import.meta.url));
const repo = join(here, "..", "..");
const outDir = join(repo, "public", "selected-work");
const manifestPath = join(repo, "src", "components", "site", "selected-work-art.json");

/** Scene page, output name and render settings (full quality). */
const jobs = {
  bolt: { name: "toolswift-bolt", query: { size: 1400, frames: 40 } },
  receipt: { name: "smooth-erp-receipt", query: { size: 1400, frames: 40 } },
  aligner: { name: "aligna-aligner", query: { size: 1400, frames: 40 } },
  badge: { name: "wajihni-badge", query: { size: 1400, frames: 40 } },
};

const args = process.argv.slice(2);
const quick = args.includes("--quick");
const selected = args.filter((arg) => !arg.startsWith("--"));
for (const key of selected)
  if (!(key in jobs)) {
    console.error(`Unknown scene "${key}". Choose from: ${Object.keys(jobs).join(", ")}`);
    process.exit(2);
  }

const roots = {
  "/three/": join(repo, "node_modules", "three"),
  "/public/": join(repo, "public"),
  "/fonts/": join(repo, "src", "fonts"),
  "/tokens/": join(repo, "src", "styles"),
  "/art/": here,
};
const types = {
  ".js": "text/javascript",
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".css": "text/css",
};
const server = createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const prefix = Object.keys(roots).find((candidate) => path.startsWith(candidate));
  const file = prefix ? normalize(join(roots[prefix], path.slice(prefix.length))) : null;
  if (!file || !file.startsWith(roots[prefix])) return response.writeHead(404).end();
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
await mkdir(outDir, { recursive: true });
const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : {};
let failed = false;

for (const [key, job] of Object.entries(jobs)) {
  if (selected.length && !selected.includes(key)) continue;
  const query = { ...job.query, ...(quick ? { frames: 4 } : {}) };
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on("pageerror", (error) => console.error(`[${key}]`, error.message));
  const started = Date.now();
  await page.goto(`${origin}/art/scenes/${key}.html?${new URLSearchParams(query)}`);
  await page.waitForFunction(() => window.__result || window.__error, null, { timeout: 0 });
  const result = await page.evaluate(() => window.__result ?? { error: window.__error });
  await page.close();
  if (result.error) {
    console.error(`[${key}] failed: ${result.error}`);
    failed = true;
    continue;
  }
  await writeFile(
    join(outDir, `${job.name}.webp`),
    Buffer.from(result.webp.split(",")[1], "base64"),
  );
  manifest[job.name] = { width: result.width, height: result.height, ...(result.meta ?? {}) };
  console.log(
    `${job.name}.webp ${result.width}x${result.height} in ${Math.round((Date.now() - started) / 1000)}s`,
  );
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
