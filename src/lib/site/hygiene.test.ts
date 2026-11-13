import { describe, expect, it } from "vitest";
import { ALLOW_MARKER, checkPaths, scanSecrets } from "./hygiene";

describe("checkPaths", () => {
  it("accepts ordinary source and the example environment file", () => {
    expect(
      checkPaths(["src/app/page.tsx", "docs/deployment.md", ".env.example", "pnpm-lock.yaml"]),
    ).toEqual([]);
  });

  it.each([
    [".env", "environment file"],
    [".env.local", "environment file"],
    [".env.production", "environment file"],
    ["config/.env", "environment file"],
    ["certs/site.pem", "key or certificate file"],
    ["id.key", "key or certificate file"],
    [".next/server/app.js", "generated output"],
    ["node_modules/x/index.js", "generated output"],
    ["playwright-report/index.html", "generated output"],
    ["test-results/a.txt", "generated output"],
    [".vercel/project.json", "generated output"],
    [".launch-build/package.json", "generated output"],
    ["tsconfig.tsbuildinfo", "generated output"],
  ])("flags %s", (path, rule) => {
    expect(checkPaths([path])).toEqual([{ path, line: null, rule }]);
  });

  it("normalises Windows separators", () => {
    expect(checkPaths(["config\\.env"])).toEqual([
      { path: "config/.env", line: null, rule: "environment file" },
    ]);
  });
});

describe("scanSecrets", () => {
  const key = "-----BEGIN " + "PRIVATE KEY-----";
  const aws = "AKIA" + "ABCDEFGHIJKLMNOP";
  const github = "ghp_" + "a".repeat(36);
  const slack = "xoxb-" + "1234567890-abcdef";
  const assignment = ["pass", "word = 'abcdefghijklmnopqrstuvwxyz'"].join("");

  it("finds each kind of secret and reports the line, never the value", () => {
    const text = ["const a = 1;", key, aws, github, slack, assignment].join("\n");
    const findings = scanSecrets([{ path: "src/x.ts", text }]);
    expect(findings.map((f) => f.rule)).toEqual([
      "private key block",
      "AWS access key id",
      "GitHub token",
      "Slack token",
      "quoted credential assignment",
    ]);
    expect(findings.map((f) => f.line)).toEqual([2, 3, 4, 5, 6]);
    expect(JSON.stringify(findings)).not.toContain("abcdefghijklmnopqrstuvwxyz");
    expect(JSON.stringify(findings)).not.toContain(aws);
  });

  it("ignores ordinary code and short values", () => {
    const text = [
      'const token = "short";',
      "const password = process.env.PASSWORD;",
      'const label = "api key guide";',
    ].join("\n");
    expect(scanSecrets([{ path: "src/x.ts", text }])).toEqual([]);
  });

  it("skips files without text and lines carrying the allow marker", () => {
    expect(scanSecrets([{ path: "logo.png", text: null }])).toEqual([]);
    expect(scanSecrets([{ path: "src/x.ts", text: `${aws} // ${ALLOW_MARKER}` }])).toEqual([]);
  });
});
