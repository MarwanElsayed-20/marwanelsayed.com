"use client";

import { useEffect } from "react";
import { chooseCurrentSection } from "@/lib/site/current-section";

/** Only the current-item marker needs JavaScript; links and disclosure are server HTML. */
export function CaseStudyOutlineActive({ ids }: { ids: readonly string[] }) {
  useEffect(() => {
    const sections = ids.flatMap((id) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    const links = document.querySelectorAll<HTMLAnchorElement>("[data-case-study-outline] a");
    const update = () => {
      const current = chooseCurrentSection(
        sections.map((element) => ({
          id: element.id,
          top: element.getBoundingClientRect().top - 100,
        })),
      );
      links.forEach((link) => {
        if (link.hash === `#${current}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    let frame: number | undefined;
    const schedule = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        update();
      });
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(schedule, { threshold: [0, 1] });
    sections.forEach((section) => observer?.observe(section));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
      links.forEach((link) => link.removeAttribute("aria-current"));
    };
  }, [ids]);
  return null;
}
