import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import process from "node:process";
import { digitalExperiencesProjects } from "../../src/content/projects/digital-experiences";
import { digitalProductsProjects } from "../../src/content/projects/digital-products";
import { aboutContent } from "../../src/content/site/about";
import { contactDetails } from "../../src/content/site/contact";
import { homeContent } from "../../src/content/site/home";
import { siteName } from "../../src/content/site/identity";
import { evaluateReadiness, formatReport, type ReportFormat } from "../../src/lib/site/readiness";
import { checkPaths, type TrackedFile } from "../../src/lib/site/hygiene";

const MAX_SCAN_BYTES = 1024 * 1024;
const SKIP_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|mp4|webm|zip|gz)$/i;
const SKIP_FILES = new Set(["pnpm-lock.yaml"]);

// Keep forbidden content unread while still failing on sensitive paths the legacy gate
// does not classify (for example a generic credentials directory).
const NEVER_READ_PATH =
  /(^|[\\/])(?:\.env[^\\/]*|\.aws|\.ssh|\.gnupg|keys?|(?:secrets?|credentials)(?:\.[^\\/]+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?)(?:[\\/]|$)|\.(?:pem|key|p12|pfx|keystore)$/i;
const CREDENTIAL_PATH =
  /(^|[\\/])(?:\.aws|\.ssh|\.gnupg|keys?|(?:secrets?|credentials)(?:\.[^\\/]+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?)(?:[\\/]|$)/i;

function parseFormat(argv: readonly string[]): ReportFormat {
  const index = argv.indexOf("--format");
  if (index === -1) return "text";
  const value = argv[index + 1];
  if (value === "text" || value === "markdown" || value === "json") return value;
  throw new Error(`Unknown --format value "${value}". Use text, markdown or json.`);
}

function listFiles(): string[] {
  const output = execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${process.cwd().replaceAll("\\", "/")}`,
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "-z",
    ],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  return output.split("\0").filter((path) => path !== "");
}

function readScannable(path: string): string | null {
  if (SKIP_FILES.has(path) || SKIP_EXTENSIONS.test(path)) return null;
  // Report forbidden paths by name without opening their contents.
  if (NEVER_READ_PATH.test(path)) return null;
  if (!existsSync(path)) return null;
  if (statSync(path).size > MAX_SCAN_BYTES) return null;
  const buffer = readFileSync(path);
  if (buffer.includes(0)) return null;
  return buffer.toString("utf8");
}

function main(): number {
  const format = parseFormat(process.argv.slice(2));
  const files = listFiles();
  if (files.some((path) => CREDENTIAL_PATH.test(path) && checkPaths([path]).length === 0)) {
    throw new Error(
      "Forbidden credential paths are present; contents were not opened. Remove or ignore those files before checking launch readiness.",
    );
  }
  const trackedFiles: TrackedFile[] = files.map((path) => ({
    path,
    text: readScannable(path),
  }));
  const report = evaluateReadiness({
    siteName,
    home: homeContent,
    about: aboutContent,
    contact: contactDetails,
    siteUrlRaw: process.env.SITE_URL,
    realProjectCounts: {
      digitalExperiences: digitalExperiencesProjects.filter((p) => p.sample !== true).length,
      digitalProducts: digitalProductsProjects.filter((p) => p.sample !== true).length,
    },
    trackedFiles,
  });
  process.stdout.write(formatReport(report, format));
  return report.ready ? 0 : 1;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(
    `launch:check could not run: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 2;
}
