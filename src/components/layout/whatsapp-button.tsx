import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { whatsappLabel, whatsappUrl } from "@/lib/site/whatsapp";

/**
 * A round button fixed to the corner of every page that opens a WhatsApp chat in a new tab. It is
 * white with a shadow like the header's "Get in touch" pill, so it shows on paper, on the dark
 * scenes and on the lime band, and turns lime on hover. It steps aside while the menu is open,
 * during a page change and once the footer (which has the same link) comes into view.
 */
export function WhatsAppButton({ number }: { number: string }) {
  return (
    <a
      href={whatsappUrl(number)}
      target="_blank"
      rel="noopener noreferrer"
      data-whatsapp-button
      data-cursor="link"
      className="lime-sweep fixed right-[clamp(1rem,2vw,2.5rem)] bottom-[clamp(1rem,2vw,2.5rem)] z-40 grid size-[clamp(3rem,3.4vw,4rem)] place-items-center rounded-full bg-surface text-foreground shadow-md transition-opacity duration-(--duration-base) ease-standard focus-visible:outline-foreground"
    >
      <WhatsAppIcon className="size-[52%]" />
      <span className="sr-only">{whatsappLabel} (opens in a new tab)</span>
    </a>
  );
}
