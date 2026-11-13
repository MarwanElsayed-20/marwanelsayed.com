import { BackToTop } from "@/components/layout/back-to-top";
import { FooterClock } from "@/components/layout/footer-clock";
import { FooterFocus } from "@/components/layout/footer-focus";
import { Container } from "@/components/ui/container";
import { BaseLink } from "@/components/ui/link";
import { SplitWords } from "@/components/ui/split-words";
import { navItems } from "@/config/navigation";
import { site } from "@/config/site";
import { footerPlace, siteSource } from "@/content/site/contact";
import type { ContactDetails } from "@/content/site/types";
import { siteContent } from "@/lib/site-content";
import { whatsappLabel, whatsappUrl } from "@/lib/site/whatsapp";

const linkClass =
  "lime-sweep inline-flex min-h-11 items-center rounded-sm text-[clamp(1rem,0.78rem+0.5vw,1.5rem)] text-background focus-visible:outline-background";
const heading =
  "text-[clamp(1.25rem,0.8rem+1vw,2.25rem)] leading-[1.15] font-light text-background";
const small = "text-[clamp(0.8125rem,0.72rem+0.25vw,1.0625rem)] leading-[1.7] text-background/80";

type SiteFooterProps = {
  /** Defaults to the owner-supplied contact details. Tests pass their own. */
  contact?: ContactDetails;
};

/**
 * The site's close: the silk panel, the sitemap and profiles beside a
 * large email with a wave that slides under it, where I am and the time there, the name
 * set large at the bottom, and a round button back to the top.
 */
export function SiteFooter({ contact = siteContent.contact }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      data-surface="dark"
      data-uncover
      className="sticky bottom-0 z-0 flex min-h-svh flex-col overflow-hidden bg-foreground text-background"
    >
      <div data-silk aria-hidden="true" />
      <FooterFocus />
      <Container className="relative z-10 flex flex-1 flex-col pt-[clamp(5.5rem,17svh,11rem)] pb-[clamp(0.5rem,1.2vw,1.5rem)]">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Footer" className="flex flex-col gap-[clamp(1rem,2.4svh,2rem)]">
            <span data-reveal="fade" className={heading}>
              Sitemap
            </span>
            <ul className="flex flex-col">
              {navItems.map((item, index) => (
                <li key={item.href} data-reveal="fade" data-reveal-delay={index * 0.1}>
                  <BaseLink href={item.href} className={linkClass}>
                    {item.label}
                  </BaseLink>
                </li>
              ))}
            </ul>
          </nav>
          {contact.profiles.length > 0 || contact.whatsapp ? (
            <div className="flex flex-col gap-[clamp(1rem,2.4svh,2rem)]">
              <span data-reveal="fade" data-reveal-delay="0.1" className={heading}>
                Follow me
              </span>
              <ul className="flex flex-col">
                {contact.profiles.map((profile, index) => (
                  <li key={profile.url} data-reveal="fade" data-reveal-delay={0.1 + index * 0.1}>
                    <BaseLink href={profile.url} className={linkClass}>
                      {profile.label}
                    </BaseLink>
                  </li>
                ))}
                {contact.whatsapp ? (
                  <li data-reveal="fade" data-reveal-delay={0.1 + contact.profiles.length * 0.1}>
                    <BaseLink href={whatsappUrl(contact.whatsapp)} className={linkClass}>
                      {whatsappLabel}
                    </BaseLink>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
          {contact.email !== null ? (
            <div className="flex flex-col gap-2 sm:col-span-2">
              <span
                data-reveal="fade"
                className={`${heading} text-[clamp(1.5rem,0.9rem+1.5vw,3.1rem)]`}
              >
                Work with me:
              </span>
              <a
                href={`mailto:${contact.email}`}
                data-reveal="fade"
                data-reveal-delay="0.1"
                data-footer-email
                className="group relative inline-block max-w-full self-start rounded-sm pb-3 text-[clamp(1.5rem,0.9rem+1.5vw,3.1rem)] leading-[1.15] font-light tracking-[-0.02em] [overflow-wrap:anywhere] text-background focus-visible:outline-background"
              >
                {contact.email}
                <span aria-hidden="true" data-footer-wave>
                  <svg viewBox="0 0 1200 24" preserveAspectRatio="none">
                    <path d="M0 18H380C450 18 500 6 600 6C700 6 750 18 820 18H1200" />
                  </svg>
                </span>
              </a>
            </div>
          ) : null}
        </div>

        <div
          data-reveal="fade"
          className={`mt-[clamp(2.5rem,9svh,6rem)] flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-x-10 ${small}`}
        >
          <span>Based in {footerPlace.label}</span>
          <FooterClock timeZone={footerPlace.timeZone} />
          <span>
            © {year} {site.name} ·{" "}
            <BaseLink
              href={siteSource.url}
              className="lime-sweep -my-3.5 inline-block rounded-sm py-3.5 text-background focus-visible:outline-background"
            >
              {siteSource.label}
            </BaseLink>
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-[clamp(0.5rem,1.2vw,1.5rem)] pt-[clamp(2.5rem,6svh,5rem)]">
          <div className="flex justify-end">
            <BackToTop />
          </div>
          <div data-footer-name aria-hidden="true">
            <p>
              <SplitWords text={site.name} step={0.08} />
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
