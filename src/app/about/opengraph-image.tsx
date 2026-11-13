import { site } from "@/config/site";
import { pageEntry } from "@/lib/site-pages";
import { shareImage } from "@/lib/share/share-image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
const entry = pageEntry("about");
export const alt = typeof entry.title === "string" ? entry.title : entry.title.absolute;
export default function Image() {
  return shareImage({ ownerName: site.name, title: alt, line: entry.description });
}
