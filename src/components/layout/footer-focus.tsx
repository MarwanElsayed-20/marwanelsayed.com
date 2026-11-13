"use client";

import { useEffect } from "react";

/**
 * The footer is uncovered from under the page, so until the page end rises off it, it sits hidden
 * behind the content. Moving keyboard focus into it brings the page to its end so it is seen.
 */
export function FooterFocus() {
  useEffect(() => {
    const footer = document.querySelector("[data-uncover]");
    if (!footer) return;
    const onFocus = () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    };
    footer.addEventListener("focusin", onFocus);
    return () => footer.removeEventListener("focusin", onFocus);
  }, []);
  return null;
}
