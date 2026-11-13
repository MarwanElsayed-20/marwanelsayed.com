import { site } from "@/config/site";
import { homeContent } from "@/content/site/home";
import { pageEntry } from "@/lib/site-pages";
import { shareImage } from "@/lib/share/share-image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
const entry = pageEntry("home");
export const alt = typeof entry.title === "string" ? entry.title : entry.title.absolute;
// The wordmark already carries the name, so the card leads with the headline.
export default function Image() {
  return shareImage({ ownerName: site.name, title: homeContent.headline, line: entry.description });
}
