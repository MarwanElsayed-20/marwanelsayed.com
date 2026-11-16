import { JsonLd } from "@/components/seo/json-ld";
import { AboutPage } from "@/components/site/about-page";
import { destinationLinks, NotSupplied } from "@/components/site/not-supplied";
import { aboutPage } from "@/content/site/about";
import { footerPlace } from "@/content/site/contact";
import { resolveAboutLinks, workLinks } from "@/lib/projects/about-links";
import { productProjects, projects } from "@/lib/projects/repository";
import { topTechnologies } from "@/lib/projects/technologies";
import { aboutSupplied, siteContent } from "@/lib/site-content";
import { metadataFor } from "@/lib/site-pages";
import { aboutStructuredData } from "@/lib/structured-data";

export const metadata = metadataFor("about");

const currentWork = resolveAboutLinks(aboutPage.current.seen, workLinks);

export default function AboutRoute() {
  if (!aboutSupplied || siteContent.siteName === null) {
    return (
      <NotSupplied
        title="About"
        message="This page is being prepared."
        links={destinationLinks("/about")}
      />
    );
  }
  return (
    <>
      <JsonLd data={aboutStructuredData()} />
      <AboutPage
        content={siteContent.about}
        name={siteContent.siteName}
        role={siteContent.home.headline}
        place={footerPlace.label}
        email={siteContent.contact.email}
        profiles={siteContent.contact.profiles}
        whatsapp={siteContent.contact.whatsapp}
        currentWork={currentWork}
        counts={{ experiences: projects.length, products: productProjects.length }}
        technologies={topTechnologies(
          [...projects, ...productProjects],
          18,
          aboutPage.approach.toolsLeftOut,
        )}
      />
    </>
  );
}
