import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
const [, , command, ...args] = process.argv;
if (!["build", "check"].includes(command ?? "")) {
  process.stderr.write("Usage: pnpm illustrations:<build|check> [slug]\n");
  process.exit(2);
}
const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const tsc = join(dirname(require.resolve("typescript")), "..", "bin", "tsc");
const compile = spawnSync(process.execPath, [tsc, "-p", "tsconfig.illustrations.json"], {
  cwd: root,
  stdio: "inherit",
});
if (compile.status !== 0) {
  process.stderr.write("Could not compile illustration tools.\n");
  process.exit(2);
}
mkdirSync(join(root, ".illustrations-build"), { recursive: true });
writeFileSync(join(root, ".illustrations-build/package.json"), '{ "type": "commonjs" }\n');
const run = spawnSync(
  process.execPath,
  [join(root, ".illustrations-build/scripts/illustrations/main.js"), command, ...args],
  { cwd: root, stdio: "inherit" },
);
process.exit(run.status ?? 2);
