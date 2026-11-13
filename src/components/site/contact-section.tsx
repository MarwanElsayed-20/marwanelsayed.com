import { ContactForm } from "@/components/site/contact-form";
import { BaseLink } from "@/components/ui/link";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import type { ProfileLink } from "@/content/site/types";
import { whatsappLabel, whatsappUrl } from "@/lib/site/whatsapp";

type ContactSectionProps = {
  email: string;
  profiles: readonly ProfileLink[];
  whatsapp?: string | null;
};

/**
 * The home page's contact band: our lime, the invitation and the direct channels on the left, and
 * the form on a card with an offset block on the right.
 */
export function ContactSection({ email, profiles, whatsapp = null }: ContactSectionProps) {
  return (
    <section
      aria-labelledby="contact-heading"
      data-surface="lime"
      className="bg-highlight py-[clamp(4rem,10vh,7rem)] text-foreground"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-10">
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            <h2
              id="contact-heading"
              className="text-[clamp(3rem,1.4rem+4.6vw,7.25rem)] leading-[0.95] font-light tracking-[-0.04em] text-balance"
            >
              <SplitWords text="Tell me what you are building." step={0.06} />
            </h2>
            <p
              data-reveal="fade"
              data-reveal-delay="0.2"
              className="max-w-[34ch] text-lead text-foreground/80"
            >
              Your message goes to my email and I reply from there. A few lines about the project is
              plenty.
            </p>
            <div data-reveal="fade" className="flex flex-col gap-8">
              <a
                href={`mailto:${email}`}
                className="lime-sweep inline-flex min-h-11 items-center self-start rounded-sm border-b border-current font-serif text-h3"
              >
                {email}
              </a>
              {profiles.length > 0 || whatsapp ? (
                <ul className="flex flex-wrap gap-x-8 gap-y-2">
                  {profiles.map((profile) => (
                    <li key={profile.url}>
                      <BaseLink
                        href={profile.url}
                        className="lime-sweep inline-flex min-h-11 items-center rounded-sm text-label font-semibold tracking-[0.14em] uppercase"
                      >
                        {profile.label}
                      </BaseLink>
                    </li>
                  ))}
                  {whatsapp ? (
                    <li>
                      <BaseLink
                        href={whatsappUrl(whatsapp)}
                        className="lime-sweep inline-flex min-h-11 items-center rounded-sm text-label font-semibold tracking-[0.14em] uppercase"
                      >
                        {whatsappLabel}
                      </BaseLink>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </div>
          <div
            data-reveal="fade"
            data-reveal-delay="0.1"
            data-contact-card
            className="rounded-xl bg-surface p-6 text-foreground shadow-[1.1rem_1.1rem_0_color-mix(in_srgb,var(--color-foreground)_28%,var(--color-highlight))] sm:p-8 lg:col-span-6"
          >
            <noscript>
              <style>{"[data-contact-form]{display:none!important}"}</style>
              <p className="max-w-reading text-lead text-muted">
                The form needs JavaScript. You can email me directly at{" "}
                <a
                  href={`mailto:${email}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {email}
                </a>
                .
              </p>
            </noscript>
            <ContactForm email={email} />
          </div>
        </div>
      </Container>
    </section>
  );
}
