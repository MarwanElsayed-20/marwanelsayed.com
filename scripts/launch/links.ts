import process from "node:process";
import { digitalExperiencesProjects } from "../../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../../src/content/projects/digital-products";
import { contactDetails } from "../../src/content/site/contact";
import { collectExternalLinks } from "../../src/lib/site/external-links";

type Outcome = { readonly ok: boolean; readonly detail: string };

const TIMEOUT_MS = 10_000;

async function probe(url: string): Promise<Outcome> {
  let last: Outcome = { ok: false, detail: "not requested" };
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.ok) return { ok: true, detail: `HTTP ${response.status}` };
      last = { ok: false, detail: `HTTP ${response.status}` };
      if (method === "HEAD" && (response.status === 403 || response.status === 405)) continue;
      return last;
    } catch (error) {
      last = { ok: false, detail: error instanceof Error ? error.message : String(error) };
    }
  }
  return last;
}

async function main(): Promise<number> {
  const links = collectExternalLinks({
    profiles: contactDetails.profiles,
    digitalExperiences: digitalExperiencesProjects,
    digitalProducts: digitalProductsProjects,
  });
  if (links.length === 0) {
    process.stdout.write("No external links to check.\n");
    return 0;
  }
  let unreachable = 0;
  for (const link of links) {
    const outcome = await probe(link.url);
    if (!outcome.ok) unreachable += 1;
    process.stdout.write(
      `${outcome.ok ? "REACHABLE  " : "UNREACHABLE"}  ${link.url}  (${outcome.detail})  [${link.source}]\n`,
    );
  }
  process.stdout.write(`\n${links.length - unreachable} reachable, ${unreachable} unreachable.\n`);
  return unreachable === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    process.stderr.write(
      `links:check could not run: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 2;
  });
