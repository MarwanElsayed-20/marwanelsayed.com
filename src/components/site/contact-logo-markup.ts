import { techLogos, type TechLogo } from "@/components/hero/tech-logos";

/** The stack the contact band throws around: the same technologies the hero shows. */
export const contactLogos: readonly TechLogo[] = techLogos;

/** Logos drawn in near-white (made for dark scenes) sit on a dark tile instead of a white one. */
const DRAWN_FOR_DARK: ReadonlySet<string> = new Set(["Socket.IO", "Three.js"]);

export const tileTone = (logo: TechLogo): "light" | "dark" =>
  DRAWN_FOR_DARK.has(logo.title) ? "dark" : "light";

/** An inline svg for a logo. The data writes its fills as "@rrggbb"; they become real colours here. */
export function logoSvg({ title, viewBox, markup }: TechLogo): string {
  return `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false" data-logo="${title}">${markup.replace(/@([0-9a-f]{6})/gi, "#$1")}</svg>`;
}
