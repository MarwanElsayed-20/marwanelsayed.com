import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { navItems } from "@/config/navigation";

/**
 * Without scripting the menu button cannot work, so a plain list of links takes its place. With
 * scripting the list is never rendered (<noscript>) and the menu overlay is used.
 */
const noScriptCss =
  "[data-menu-toggle]{display:none!important}header nav ul{display:flex;flex-wrap:wrap;gap:1rem}";

export function SiteHeader() {
  return (
    <header data-site-header className="absolute inset-x-0 top-0 z-50">
      <Container className="flex items-center justify-between gap-x-4 pt-[clamp(0.75rem,1.7vw,2.5rem)] pb-3">
        {/* As tall as the header pills (the same clamp as `pill` in site-nav) with the mark filling it,
            so their top, bottom and centre line are the same. The text classes only matter if the
            name is ever shown as text again. */}
        <Link
          href="/"
          className="relative z-10 flex h-[clamp(2.5rem,2.6vw,4rem)] min-w-0 items-center overflow-hidden rounded-sm text-[clamp(1.5rem,2.5vw,3.5rem)] font-bold tracking-tight text-foreground uppercase transition-opacity duration-(--duration-fast) ease-standard hover:opacity-70"
        >
          <Logo className="h-full w-auto shrink-0" />
        </Link>
        <SiteNav />
      </Container>
      <noscript>
        <style>{noScriptCss}</style>
        <nav aria-label="Primary" className="px-gutter pb-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>
    </header>
  );
}
