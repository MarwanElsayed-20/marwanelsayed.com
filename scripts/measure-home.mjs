import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";
import process, { stderr, stdout } from "node:process";
import { chromium } from "@playwright/test";

const WEBGL_ARGS = [
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

const PROFILES = {
  mobile: {
    context: {
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    },
    cpuRate: 4,
    network: { latency: 150, down: (1.6 * 1024 * 1024) / 8, up: (750 * 1024) / 8 },
  },
  desktop: {
    context: { viewport: { width: 1440, height: 900 } },
    cpuRate: 1,
    network: { latency: 40, down: (10 * 1024 * 1024) / 8, up: (10 * 1024 * 1024) / 8 },
  },
};

const INIT = `
(() => {
  window.__m = { fcp: 0, lcp: 0, cls: 0, longTasks: [], readyAt: null };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.longTasks.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
  const watch = () => {
    const s = document.querySelector('[data-hero-stage]');
    if (!s) return false;
    const check = () => { if (s.getAttribute('data-hero-state') === 'ready' && window.__m.readyAt === null) window.__m.readyAt = performance.now(); };
    check();
    new MutationObserver(check).observe(s, { attributes: true, attributeFilter: ['data-hero-state'] });
    return true;
  };
  document.addEventListener('DOMContentLoaded', () => {
    if (!watch()) {
      new MutationObserver((_, o) => { if (watch()) o.disconnect(); }).observe(document.documentElement, { childList: true, subtree: true });
    }
  });
})();
`;

function parseArgs(argv) {
  const options = {
    url: "http://127.0.0.1:3000",
    variant: "scene",
    profile: "mobile",
    runs: 5,
    out: null,
    path: null,
    paths: null,
    channel: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === "--url") options.url = value;
    else if (flag === "--variant") options.variant = value;
    else if (flag === "--profile") options.profile = value;
    else if (flag === "--runs") options.runs = Number(value);
    else if (flag === "--out") options.out = value;
    else if (flag === "--path") options.path = value;
    else if (flag === "--paths") options.paths = value.split(",");
    else if (flag === "--channel") options.channel = value;
    else continue;
    i += 1;
  }
  return options;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function measureOnce(browser, options, profile) {
  const context = await browser.newContext({
    ...profile.context,
    ...(options.variant === "reduced-motion" ? { reducedMotion: "reduce" } : {}),
    ...(options.variant === "nojs" ? { javaScriptEnabled: false } : {}),
  });
  const page = await context.newPage();
  await page.addInitScript({ content: INIT });

  const cdp = await context.newCDPSession(page);
  const protocolPaint = { lcpEpochSeconds: 0, cls: 0 };
  if (options.variant === "nojs") {
    cdp.on("PerformanceTimeline.timelineEventAdded", ({ event }) => {
      if (event.type === "largest-contentful-paint")
        protocolPaint.lcpEpochSeconds =
          event.lcpDetails?.renderTime || event.lcpDetails?.loadTime || event.time;
      if (event.type === "layout-shift" && !event.layoutShiftDetails?.hadRecentInput)
        protocolPaint.cls += event.layoutShiftDetails?.value ?? 0;
    });
    await cdp.send("PerformanceTimeline.enable", {
      eventTypes: ["largest-contentful-paint", "layout-shift"],
    });
  }
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: profile.network.latency,
    downloadThroughput: profile.network.down,
    uploadThroughput: profile.network.up,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuRate });

  const types = new Map();
  const sizes = { total: 0, js: 0, font: 0, jsRequests: 0 };
  cdp.on("Network.responseReceived", (event) => {
    types.set(event.requestId, event.type);
  });
  cdp.on("Network.loadingFinished", (event) => {
    const bytes = event.encodedDataLength ?? 0;
    const type = types.get(event.requestId);
    sizes.total += bytes;
    if (type === "Script") {
      sizes.js += bytes;
      sizes.jsRequests += 1;
    } else if (type === "Font") {
      sizes.font += bytes;
    }
  });

  const path =
    options.path && options.path !== "/"
      ? options.path
      : options.variant === "fallback"
        ? "/?hero=fallback"
        : "/";
  await page.goto(new URL(path, options.url).toString(), { waitUntil: "load" });
  if (options.variant === "scene" && (options.path === null || options.path === "/")) {
    await page
      .waitForFunction("window.__m && window.__m.readyAt !== null", null, { timeout: 90000 })
      .catch(() => {});
  }
  await page.waitForTimeout(3000);

  const m = await page.evaluate(() => ({
    fcp: 0,
    lcp: 0,
    cls: 0,
    longTasks: [],
    readyAt: null,
    ...window.__m,
    timeOrigin: performance.timeOrigin,
    paintFcp:
      performance.getEntriesByType("paint").find((entry) => entry.name === "first-contentful-paint")
        ?.startTime ?? 0,
    loadMs: performance.getEntriesByType("navigation")[0].loadEventEnd,
  }));
  if (options.variant === "nojs") {
    m.fcp = m.paintFcp;
    m.lcp = protocolPaint.lcpEpochSeconds * 1000 - m.timeOrigin;
    m.cls = protocolPaint.cls;
    if (m.lcp <= 0)
      throw new Error("No valid no-JavaScript LCP event was observed by the browser protocol");
  }
  await context.close();

  const tbt = m.longTasks
    .filter(([start]) => start >= m.fcp && start < m.loadMs)
    .reduce((sum, [, duration]) => sum + Math.max(0, duration - 50), 0);

  return {
    transferBytes: sizes.total,
    jsBytes: sizes.js,
    fontBytes: sizes.font,
    otherBytes: sizes.total - sizes.js - sizes.font,
    jsRequests: sizes.jsRequests,
    fcpMs: m.fcp > 0 ? Math.round(m.fcp) : null,
    lcpMs: Math.round(m.lcp),
    cls: Number(m.cls.toFixed(4)),
    tbtMs: options.variant === "nojs" ? null : Math.round(tbt),
    readyMs: m.readyAt === null ? null : Math.round(m.readyAt),
  };
}

const options = parseArgs(process.argv);
const profile = PROFILES[options.profile];
if (!profile) {
  stderr.write(`Unknown profile: ${options.profile}\n`);
  process.exit(1);
}

const browser = await chromium.launch({
  args: WEBGL_ARGS,
  ...(options.channel ? { channel: options.channel } : {}),
});
const version = browser.version();
const commit = execFileSync(
  "git",
  ["-c", "safe.directory=" + process.cwd().replaceAll("\\", "/"), "rev-parse", "HEAD"],
  { encoding: "utf8" },
).trim();
const results = [];
try {
  for (const path of options.paths ?? [options.path]) {
    const current = { ...options, path };
    const samples = [];
    for (let run = 0; run < options.runs; run += 1)
      samples.push(await measureOnce(browser, current, profile));
    const medians = Object.fromEntries(
      Object.keys(samples[0]).map((key) => [
        key,
        median(samples.map((sample) => sample[key]).filter((value) => value !== null)),
      ]),
    );
    results.push({
      page: path ?? "/",
      profile: options.profile,
      scene: path && path !== "/" ? "not-applicable" : options.variant,
      scores: { performance: null, accessibility: null, bestPractices: null, seo: null },
      metrics: { cls: medians.cls, lcpMs: medians.lcpMs, tbtMs: medians.tbtMs },
      method: {
        tool: "Playwright CDP",
        browser: `Chrome ${version}`,
        date: new Date().toISOString(),
        commit,
        cpuRate: profile.cpuRate,
        network: profile.network,
        runs: options.runs,
        categoryScores: "Not measured; run Lighthouse separately",
        scripting:
          options.variant === "nojs"
            ? "Application JavaScript disabled; LCP/CLS from CDP PerformanceTimeline; TBT unavailable"
            : "enabled",
      },
      variant: options.variant,
      path: path ?? (options.variant === "fallback" ? "/?hero=fallback" : "/"),
      url: options.url,
      median: medians,
      samples,
    });
  }
} finally {
  await browser.close();
}
const result = options.paths ? results : results[0];
const text = `${JSON.stringify(result, null, 2)}\n`;
stdout.write(text);
if (options.out) {
  await mkdir(dirname(options.out), { recursive: true });
  await writeFile(options.out, text, { flag: "wx" });
}
