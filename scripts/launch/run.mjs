import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";

const ENTRIES = new Map([
  ["check", "check.js"],
  ["links", "links.js"],
  ["site", "check-site.js"],
]);

const [, , command, ...args] = process.argv;
const entry = ENTRIES.get(command ?? "");
if (entry === undefined) {
  process.stderr.write("Usage: node scripts/launch/run.mjs <check|links|site> [options]\n");
  process.exit(2);
}

// Compile with the repository's own TypeScript, then run the result with Node. No new package.
const require = createRequire(import.meta.url);
const tsc = join(dirname(require.resolve("typescript")), "..", "bin", "tsc");
const compile = spawnSync(process.execPath, [tsc, "-p", "tsconfig.launch.json"], {
  stdio: "inherit",
});
if (compile.status !== 0) {
  process.stderr.write("Could not compile the launch tools (see the errors above).\n");
  process.exit(2);
}

// The repository is an ES module package; the compiled output is CommonJS.
mkdirSync(".launch-build", { recursive: true });
writeFileSync(join(".launch-build", "package.json"), '{ "type": "commonjs" }\n');

const run = spawnSync(
  process.execPath,
  [join(".launch-build", "scripts", "launch", entry), ...args],
  { stdio: "inherit" },
);
process.exit(run.status ?? 2);
