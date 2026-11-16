import { Hero } from "@/components/hero/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactCta } from "@/components/site/contact-cta";
import { ContactSection } from "@/components/site/contact-section";
import { destinationLinks, NotSupplied } from "@/components/site/not-supplied";
import { FocusStatement } from "@/components/site/focus-statement";
import { SelectedWork } from "@/components/site/selected-work";
import { Services } from "@/components/site/services";
import { selectedScenes } from "@/lib/projects/selected-work";
import { resolvedServices } from "@/lib/projects/services";
import { siteContent } from "@/lib/site-content";
import { metadataFor } from "@/lib/site-pages";
import { homeStructuredData } from "@/lib/structured-data";

export const metadata = metadataFor("home");
export default function HomePage() {
  const { email, profiles, whatsapp } = siteContent.contact;
  return (
    <>
      <JsonLd data={homeStructuredData()} />
      <Hero />
      {siteContent.home.focus ? (
        <FocusStatement text={siteContent.home.focus} action={siteContent.home.focusAction} />
      ) : null}
      <SelectedWork scenes={selectedScenes} />
      <Services services={resolvedServices} />
      {email !== null ? (
        // Every link to #contact lands on the top edge of the invitation, with the form band below.
        <div
          id="contact"
          tabIndex={-1}
          role="group"
          aria-labelledby="contact-cta-heading"
          className="focus:outline-none"
        >
          <ContactCta />
          <ContactSection email={email} profiles={profiles} whatsapp={whatsapp} />
        </div>
      ) : (
        <NotSupplied
          title="Contact"
          message="Contact details are being prepared."
          links={destinationLinks("/#contact")}
        />
      )}
    </>
  );
}
