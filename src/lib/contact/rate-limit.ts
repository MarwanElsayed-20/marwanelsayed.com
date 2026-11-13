/**
 * A small in-memory sliding window per key. On serverless hosting each instance counts separately,
 * so this is a best-effort brake against accidental repeats and trivial abuse, not a guarantee.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const current = now();
    const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(current);
    hits.set(key, recent);
    // Drop idle keys so the map cannot grow without bound.
    if (hits.size > 500) {
      for (const [other, times] of hits) {
        if (times.every((time) => current - time >= windowMs)) hits.delete(other);
      }
    }
    return true;
  };
}
