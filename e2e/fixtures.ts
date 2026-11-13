import { test as base } from "@playwright/test";

export * from "@playwright/test";

/** Mirrors `LOADER_STORAGE_KEY` in src/lib/loader.ts. */
const INTRO_KEY = "portfolio:intro-seen";
const MOTION_KEY = "portfolio:motion";

/**
 * Every Playwright context starts with empty session storage, so the opening sequence would play
 * in every test. By default tests start as a visitor who has already seen it; the loader specs
 * opt back in with `test.use({ introSeen: false })`.
 */
export const test = base.extend<{ introSeen: boolean; entranceMotion: boolean }>({
  introSeen: [true, { option: true }],
  // Entrance reveals are off by default so content is simply there for every assertion; the
  // reveal specs opt in with `test.use({ entranceMotion: true })`.
  entranceMotion: [false, { option: true }],
  context: async ({ context, introSeen, entranceMotion }, provide) => {
    if (!entranceMotion) {
      await context.addInitScript((key) => {
        try {
          sessionStorage.setItem(key, "off");
        } catch {
          // Storage unavailable: reveals then run, which the specs tolerate.
        }
      }, MOTION_KEY);
    }
    if (introSeen) {
      await context.addInitScript((key) => {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          // Storage unavailable: the loader skips itself anyway.
        }
      }, INTRO_KEY);
    }
    await provide(context);
  },
});
