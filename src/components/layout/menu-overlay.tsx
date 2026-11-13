"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MENU_ID } from "@/components/layout/site-nav";
import type { NavItem } from "@/config/navigation";
import type { ProfileLink } from "@/content/site/types";
import { duration, ease, prefersReducedMotion } from "@/lib/motion";
import { menuStore } from "@/lib/menu-state";
import { CARD_SCALE, cardGeometry } from "@/lib/page-card";
import { lockScroll } from "@/lib/scroll-lock";
import { chooseCurrentSection } from "@/lib/site/current-section";
import { whatsappLabel, whatsappUrl } from "@/lib/site/whatsapp";

type MenuProject = { title: string; href: string };

type MenuOverlayProps = {
  items: readonly NavItem[];
  projects: readonly MenuProject[];
  profiles?: readonly ProfileLink[];
  /** The WhatsApp number (digits, country code first), when there is one. */
  whatsapp?: string | null;
};

const DESKTOP = "(min-width: 768px)";

/** The page card sits left of the list on desktop and slides fully away on mobile. */
function menuCard(shell: HTMLElement) {
  const desktop = typeof window.matchMedia !== "function" || window.matchMedia(DESKTOP).matches;
  return cardGeometry(shell, desktop ? 0.4 : 0.94);
}

/**
 * The full-screen menu. It sits behind the page: opening it pushes the page aside as a dimmed,
 * rounded card and reveals the dark sitemap; clicking the card, the close button or Escape
 * brings the page back. GSAP owns the visuals; React owns `open`, focus and the page lock.
 */
export function MenuOverlay({ items, projects, profiles = [], whatsapp = null }: MenuOverlayProps) {
  const pathname = usePathname() ?? "";
  const openFor = useSyncExternalStore(menuStore.subscribe, menuStore.get, menuStore.getServer);
  const open = openFor === pathname;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // The section in view decides what is current on the home page.
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = items.flatMap((item) => {
      const id = item.href.startsWith("/#") ? item.href.slice(2) : null;
      const element = id ? document.getElementById(id) : null;
      return element ? [element] : [];
    });
    const update = () =>
      setCurrentSection(
        chooseCurrentSection(
          sections.map((element) => ({
            id: element.id,
            top: element.getBoundingClientRect().top - 25,
          })),
        ),
      );
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
    sections.forEach((element) => observer?.observe(element));
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer?.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname, items]);

  // The menu is only ever open for the page it was opened on: once the route has moved on, forget
  // it, so coming back to that page later does not open the menu by itself.
  useEffect(() => {
    if (menuStore.get() !== null && menuStore.get() !== pathname) menuStore.set(null);
  }, [pathname]);

  // Visual open/close. Tweens start from the current state, so rapid toggling never snaps.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const root = rootRef.current;
    const shell = document.querySelector<HTMLElement>("[data-page-shell]");
    if (!root || !shell) return;
    const lines = root.querySelectorAll("[data-menu-line]");
    const dim = shell.querySelector<HTMLElement>("[data-page-dim]");
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.killTweensOf([root, shell, lines, dim]);
      if (open) {
        const card = menuCard(shell);
        gsap.set(root, { visibility: "visible" });
        gsap.set(shell, { transformOrigin: card.origin, clipPath: card.flat });
        if (reduced) {
          gsap.set(shell, { x: card.x, scale: CARD_SCALE, clipPath: card.card });
          gsap.set(dim, { opacity: 0.5 });
          gsap.set(lines, { clearProps: "transform,opacity" });
          gsap.set(root, { opacity: 1 });
          return;
        }
        gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: duration.base, ease: "none" });
        gsap.to(shell, {
          x: card.x,
          scale: CARD_SCALE,
          clipPath: card.card,
          duration: duration.long,
          ease: ease.inOut,
        });
        gsap.to(dim, { opacity: 0.5, duration: duration.long, ease: ease.inOut });
        gsap.fromTo(
          lines,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: duration.long,
            ease: ease.out,
            stagger: 0.045,
            delay: 0.25,
          },
        );
        return;
      }
      if (document.documentElement.dataset.pageTransition === "true") {
        // A page change is playing: it moves the page card itself, the menu only steps aside.
        gsap.set(root, { visibility: "hidden", opacity: 0 });
        gsap.set(lines, { clearProps: "transform,opacity" });
        return;
      }
      const finish = () => {
        gsap.set(root, { visibility: "hidden" });
        gsap.set(shell, { clearProps: "transform,transformOrigin,clipPath,opacity" });
        gsap.set(dim, { clearProps: "opacity" });
        gsap.set(lines, { clearProps: "transform,opacity" });
      };
      if (reduced) {
        finish();
        return;
      }
      gsap.to(lines, { opacity: 0, duration: duration.micro, ease: ease.soft });
      gsap.to(shell, {
        x: 0,
        scale: 1,
        clipPath: menuCard(shell).flat,
        duration: duration.long,
        ease: ease.inOut,
        onComplete: finish,
      });
      gsap.to(dim, { opacity: 0, duration: duration.long, ease: ease.inOut });
      gsap.to(root, { opacity: 0, duration: duration.base, delay: duration.base, ease: "none" });
    }, root);
    return () => ctx.kill();
  }, [open]);

  // While open: page cannot scroll, the page is inert, Escape closes, Tab stays inside the menu.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const shell = document.querySelector<HTMLElement>("[data-page-shell]");
    html.dataset.menuOpen = "true";
    const release = lockScroll();
    shell?.setAttribute("inert", "");
    const toggle = () => document.querySelector<HTMLElement>("[data-menu-toggle]");
    const frame = requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Return focus after the page is interactive again: an inert toggle cannot take focus.
        shell?.removeAttribute("inert");
        menuStore.set(null);
        toggle()?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([tabindex='-1'])") ??
          [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => menuStore.set(null);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      shell?.removeAttribute("inert");
      release();
      delete html.dataset.menuOpen;
    };
  }, [open]);

  const sectionHrefs = items.filter((item) => item.href.startsWith("/#")).map((item) => item.href);
  function currentFor(item: NavItem): "location" | "page" | undefined {
    if (pathname === "/") {
      const inView = currentSection ? `/#${currentSection}` : null;
      const target = inView && sectionHrefs.includes(inView) ? inView : "/";
      return item.href === target ? "location" : undefined;
    }
    if (item.href.includes("#") || item.href === "/") return undefined;
    if (item.href === pathname) return "page";
    return item.parent && pathname.startsWith(`${item.href}/`) ? "location" : undefined;
  }

  const close = () => {
    document.querySelector<HTMLElement>("[data-page-shell]")?.removeAttribute("inert");
    menuStore.set(null);
    document.querySelector<HTMLElement>("[data-menu-toggle]")?.focus({ preventScroll: true });
  };
  // Another page: stay open until the route changes (the transition closes it). The same page:
  // close now so the section is revealed.
  const onNavigate = (href: string) => {
    if ((href.split("#")[0] || "/") === pathname) menuStore.set(null);
  };

  const link =
    "inline-flex min-h-[clamp(2.75rem,3.2vw,4.5rem)] items-center rounded-sm text-[clamp(1.0625rem,1.35vw,1.875rem)] font-light leading-tight tracking-tight lime-sweep underline decoration-transparent decoration-2 underline-offset-8 focus-visible:outline-background aria-[current]:decoration-current";
  const heading = "text-[clamp(1.125rem,1.8vw,2.5rem)] leading-tight font-bold tracking-tight";

  return (
    <div
      ref={rootRef}
      id={MENU_ID}
      data-menu-root
      onWheel={(event) => listRef.current?.scrollBy({ top: event.deltaY })}
      className="invisible fixed inset-0 z-0 overflow-hidden bg-foreground text-background opacity-0"
    >
      <div data-silk aria-hidden="true" />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        data-menu-scrim
        onClick={close}
        className="absolute inset-y-0 left-0 w-[56%] cursor-pointer max-md:hidden"
      />
      <button
        type="button"
        data-menu-close
        data-cursor="link"
        aria-label="Close menu"
        onClick={close}
        className="fixed top-4 right-4 z-10 inline-flex size-[clamp(2.5rem,2.6vw,3.5rem)] items-center justify-center rounded-full lime-sweep border border-background/70 text-background hover:border-highlight focus-visible:outline-background md:top-[clamp(1.25rem,1.7vw,2.5rem)] md:right-[clamp(2.5rem,3.3vw,6rem)]"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div
        ref={listRef}
        data-menu-list
        data-lenis-prevent
        className="relative h-dvh overflow-y-auto overscroll-contain [scrollbar-width:none] md:ml-[63%] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-h-full flex-col gap-12 px-gutter pt-24 pb-12 md:px-0 md:pt-16">
          <div data-menu-line>
            <p className={heading}>Sitemap</p>
          </div>
          <nav aria-label="Primary" className="-mt-6">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href} data-menu-line>
                  <Link
                    href={item.href}
                    onClick={() => onNavigate(item.href)}
                    aria-current={currentFor(item)}
                    className={link}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {projects.length > 0 ? (
            <>
              <div data-menu-line>
                <p className={heading}>Selected Projects</p>
              </div>
              <nav aria-label="Selected projects" className="-mt-6">
                <ul className="flex flex-col">
                  {projects.map((project) => (
                    <li key={project.href} data-menu-line>
                      <Link
                        href={project.href}
                        onClick={() => onNavigate(project.href)}
                        className={link}
                      >
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : null}
          {profiles.length > 0 || whatsapp ? (
            <>
              <div data-menu-line>
                <p className={heading}>Follow Us</p>
              </div>
              <ul aria-label="Profiles" className="-mt-6 flex flex-col">
                {profiles.map((profile) => (
                  <li key={profile.url} data-menu-line>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={link}
                    >
                      {profile.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
                {whatsapp ? (
                  <li data-menu-line>
                    <a
                      href={whatsappUrl(whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={link}
                    >
                      {whatsappLabel}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
