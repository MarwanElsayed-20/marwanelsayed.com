import { defineConfig, devices } from "@playwright/test";

const MAIN = "http://127.0.0.1:3000";
const REVIEW = "http://127.0.0.1:3001";
const MOCK = "http://127.0.0.1:3999";

// The contact route delivers through this local stand-in, never the real email service.
const mailEnv = {
  RESEND_API_KEY: "test-key",
  RESEND_API_URL: `${MOCK}/emails`,
};

// Software WebGL so headless Chromium can render the real 3D scene. These are Chromium flags,
// so they are set on the Chromium projects only.
const chromiumLaunchOptions = {
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Concurrent software-WebGL contexts can stall Chromium on Windows.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "site",
      testIgnore: "**/review/**",
      use: { ...devices["Desktop Chrome"], baseURL: MAIN, launchOptions: chromiumLaunchOptions },
    },
    {
      name: "review",
      testMatch: "**/review/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: REVIEW, launchOptions: chromiumLaunchOptions },
    },
    // Full public suite. WebKit on Windows is an engine check, not Safari.
    {
      name: "firefox",
      testIgnore: "**/review/**",
      use: { ...devices["Desktop Firefox"], baseURL: MAIN },
    },
    {
      name: "webkit",
      testIgnore: "**/review/**",
      use: { ...devices["Desktop Safari"], baseURL: MAIN },
    },
  ],
  // Two servers from ONE production build. Run `pnpm build` first.
  // 3000: default (review pages off). 3001: review pages switched on for tests.
  webServer: [
    {
      command: "node e2e/mocks/resend-server.mjs",
      url: `${MOCK}/_health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "corepack pnpm start",
      url: MAIN,
      env: { ENABLE_REVIEW_PAGES: "false", ...mailEnv },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "corepack pnpm exec next start -p 3001",
      url: REVIEW,
      env: { ENABLE_REVIEW_PAGES: "true", ...mailEnv },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
