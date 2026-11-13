"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { menuStore } from "@/lib/menu-state";

export const MENU_ID = "site-menu";

const pill =
  "relative h-[clamp(2.5rem,2.6vw,4rem)] items-center justify-center rounded-full px-[clamp(1rem,1.7vw,2.5rem)] text-[clamp(0.75rem,1.15vw,1.25rem)] font-medium tracking-wide uppercase lime-sweep after:absolute after:-inset-2 after:content-['']";

/**
 * The two header pills. "Get in touch" turns highlight-coloured on hover; "Menu" opens the
 * full-screen menu that lives behind the page (see MenuOverlay). The menu is open for one
 * pathname only, so a route change closes it.
 */
export function SiteNav() {
  const pathname = usePathname() ?? "";
  const openFor = useSyncExternalStore(menuStore.subscribe, menuStore.get, menuStore.getServer);
  const open = openFor === pathname;

  return (
    <div className="flex shrink-0 items-center gap-[clamp(0.5rem,1.35vw,2rem)]">
      <Link
        href="/#contact"
        data-menu-contact
        data-cursor="link"
        className={cn(
          pill,
          "group hidden gap-0 bg-surface text-foreground shadow-sm hover:gap-1.5 sm:inline-flex",
        )}
      >
        Get in touch
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[0.9em] w-0 -translate-x-1 opacity-0 transition-[width,opacity,transform] duration-(--duration-base) ease-standard group-hover:w-[0.9em] group-hover:translate-x-0 group-hover:opacity-100"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </Link>
      <button
        type="button"
        data-menu-toggle
        data-cursor="link"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => {
          // The page is moving as a card: the menu waits until it has landed.
          if (document.documentElement.dataset.pageTransition === "true") return;
          menuStore.set(open ? null : pathname);
        }}
        className={cn(
          pill,
          "inline-flex min-w-16 bg-foreground text-background hover:text-foreground focus-visible:text-foreground",
        )}
      >
        Menu
      </button>
    </div>
  );
}
