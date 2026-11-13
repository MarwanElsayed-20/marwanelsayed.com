import { MenuOverlay } from "@/components/layout/menu-overlay";
import { navItems } from "@/config/navigation";
import { selectedScenes } from "@/lib/projects/selected-work";
import { siteContent } from "@/lib/site-content";

const PROJECTS_SHOWN = 3;

/**
 * The menu lists the Selected work scenes by their own names, so a family shows as its
 * ecosystem ("ToolSwift"), not as the first case study inside it. Each links to that case study.
 */
export function SiteMenu() {
  return (
    <MenuOverlay
      items={navItems}
      projects={selectedScenes
        .slice(0, PROJECTS_SHOWN)
        .map((scene) => ({ title: scene.name, href: scene.links[0].href }))}
      profiles={siteContent.contact.profiles}
      whatsapp={siteContent.contact.whatsapp}
    />
  );
}
