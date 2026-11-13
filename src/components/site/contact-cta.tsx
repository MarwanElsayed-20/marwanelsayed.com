import { ContactLogos } from "@/components/site/contact-logos";
import { SplitWords } from "@/components/ui/split-words";
import { contactCta } from "@/content/site/contact";

/**
 * The invitation above the contact form: a large centred line with logos thrown across it. The
 * logos are decoration (hidden from assistive technology); the text carries the message.
 */
export function ContactCta() {
  return (
    <section
      aria-labelledby="contact-cta-heading"
      className="relative flex min-h-[min(72svh,46rem)] items-center justify-center overflow-hidden px-gutter py-[clamp(4rem,10vh,7rem)]"
    >
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-8 text-center">
        <h2
          id="contact-cta-heading"
          className="max-w-[14ch] text-[clamp(3rem,1.4rem+4.6vw,7.25rem)] leading-[0.95] font-light tracking-[-0.04em] text-balance text-foreground"
        >
          <SplitWords text={contactCta.heading} />
        </h2>
        <p
          data-reveal="fade"
          data-reveal-delay="0.2"
          className="max-w-[34ch] text-lead text-pretty text-muted"
        >
          {contactCta.line}
        </p>
      </div>
      <ContactLogos />
    </section>
  );
}
