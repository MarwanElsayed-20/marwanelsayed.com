export type TrackedFile = {
  readonly path: string;
  /** File text for scannable files, otherwise `null` (binary, large, or unreadable). */
  readonly text: string | null;
};

export type HygieneFinding = {
  readonly path: string;
  readonly line: number | null;
  readonly rule: string;
};

/** Put this marker on a line to mark a reviewed false positive. */
export const ALLOW_MARKER = "launch-check:allow-secret-pattern";

const PATH_RULES: readonly { readonly rule: string; readonly test: (path: string) => boolean }[] = [
  {
    rule: "environment file",
    test: (path) => /(^|\/)\.env(\.[^/]+)?$/.test(path) && !path.endsWith(".example"),
  },
  {
    rule: "key or certificate file",
    test: (path) => /\.(?:pem|key|p12|pfx|keystore)$/i.test(path),
  },
  {
    rule: "generated output",
    test: (path) =>
      /(^|\/)(?:\.next|node_modules|playwright-report|test-results|\.vercel|\.launch-build)\//.test(
        path,
      ) || /\.tsbuildinfo$/.test(path),
  },
];

const SECRET_PATTERNS: readonly { readonly rule: string; readonly pattern: RegExp }[] = [
  { rule: "private key block", pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
  { rule: "AWS access key id", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { rule: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { rule: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}/ },
  {
    rule: "quoted credential assignment",
    pattern: /\b(?:secret|token|password|passwd|api[_-]?key)\b["']?\s*[:=]\s*["'][^"'\s]{16,}["']/i,
  },
];

/** Paths that must never be tracked or left unignored. Input is the `git ls-files` style list. */
export function checkPaths(paths: readonly string[]): HygieneFinding[] {
  const findings: HygieneFinding[] = [];
  for (const raw of paths) {
    const path = raw.replace(/\\/g, "/");
    for (const { rule, test } of PATH_RULES) {
      if (test(path)) findings.push({ path, line: null, rule });
    }
  }
  return findings;
}

/** Looks for high-confidence secret patterns. Never returns the matched text. */
export function scanSecrets(files: readonly TrackedFile[]): HygieneFinding[] {
  const findings: HygieneFinding[] = [];
  for (const file of files) {
    if (file.text === null) continue;
    const path = file.path.replace(/\\/g, "/");
    file.text.split(/\r?\n/).forEach((line, index) => {
      if (line.includes(ALLOW_MARKER)) return;
      for (const { rule, pattern } of SECRET_PATTERNS) {
        if (pattern.test(line)) findings.push({ path, line: index + 1, rule });
      }
    });
  }
  return findings;
}
