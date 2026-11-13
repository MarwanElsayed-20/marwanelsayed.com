"use client";

import { useEffect, useState } from "react";

/** "10:59" in the given time zone, 24-hour. */
export function timeIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/**
 * The current time where the owner is. The server cannot know the visitor's moment, so it renders a
 * dash and the time appears once the page is running; it then follows the clock.
 */
export function FooterClock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(timeIn(timeZone));
    const first = window.setTimeout(tick, 0);
    const every = window.setInterval(tick, 15_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [timeZone]);
  return (
    <span>
      Current time: <time data-footer-time>{time ?? "--:--"}</time>
    </span>
  );
}
