import type { HeroSwitch } from "./hero-capability";

const values: readonly HeroSwitch[] = ["fallback", "nowebgl", "slow", "fail", "hold", "lowperf"];

/**
 * Reads the review switch from a query string such as "?hero=fallback".
 * Every value can only move the hero toward the static fallback, so it is harmless in production.
 */
export function parseHeroSwitch(search: string): HeroSwitch | null {
  const value = new URLSearchParams(search).get("hero");
  return values.find((candidate) => candidate === value) ?? null;
}
