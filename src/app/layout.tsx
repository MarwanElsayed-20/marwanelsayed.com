import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";
import { Cursor } from "@/components/layout/cursor";
import { HashFocus } from "@/components/layout/hash-focus";
import { ScrollBar } from "@/components/layout/scroll-bar";
import { Loader } from "@/components/layout/loader";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { PageTransition } from "@/components/layout/page-transition";
import { RevealController } from "@/components/layout/reveal-controller";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteMenu } from "@/components/layout/site-menu";
import { SkipLink } from "@/components/layout/skip-link";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { VisitSignals } from "@/components/site/visit-signals";
import { site, siteDescription } from "@/config/site";
import { loaderBootScript } from "@/lib/loader";
import { siteContent } from "@/lib/site-content";
import { siteOrigin } from "@/lib/site/site-origin";
import { grotesk } from "./fonts";
import "./globals.css";

// A base address is set only when SITE_URL is a valid public origin; it is never guessed.
const origin = siteOrigin(process.env);

/** The second line of the opening sequence: what the site is about, in the owner's own two areas. */
const loaderPhrase = "Websites, SaaS & dashboards";

export const metadata: Metadata = {
  ...(origin === null ? {} : { metadataBase: new URL(origin) }),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: siteDescription,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // Font variable classes MUST be on <html> so :root-level tokens can resolve them.
    // The boot script sets data attributes on <html> before hydration, hence suppressHydrationWarning.
    <html lang="en" className={grotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderBootScript }} />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <Loader name={site.name} phrase={loaderPhrase} />
        <PageTransition />
        <Cursor />
        <ScrollBar />
        <SmoothScroll />
        <RevealController />
        <HashFocus />
        <VisitSignals />
        {/* The page. The menu sits behind it and pushes it aside as a card (see MenuOverlay). */}
        <div data-page-shell className="relative z-10 flex min-h-dvh flex-col bg-background">
          {/* Dims the page card while the menu is open, so the card stays opaque over the streaks. */}
          <div
            data-page-dim
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[60] bg-foreground opacity-0"
          />
          <SkipLink />
          <SiteHeader />
          <main
            id="main"
            tabIndex={-1}
            className="relative z-10 flex-1 bg-background pt-(--header-height) focus:outline-none"
          >
            {children}
          </main>
          <SiteFooter />
          {siteContent.contact.whatsapp ? (
            <WhatsAppButton number={siteContent.contact.whatsapp} />
          ) : null}
        </div>
        <SiteMenu />
        {/* Vercel Web Analytics and Speed Insights (cookieless). Their scripts exist only on the
            deployed site, which is the build with SITE_URL set; local and test builds leave them out. */}
        {origin !== null ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
