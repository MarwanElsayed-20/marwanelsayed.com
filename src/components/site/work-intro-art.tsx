import Image from "next/image";
import type { SceneTone } from "@/lib/contrast";
import type { ResolvedScene } from "@/lib/projects/selected-work";

/** Where each project's print lies on the panel, in percent of the panel. */
const layout: Record<SceneTone, { left: number; top: number; width: number; rotate: number }> = {
  toolswift: { left: 8, top: 8, width: 35, rotate: -3 },
  "smooth-erp": { left: 55, top: 6, width: 35, rotate: 2.5 },
  aligna: { left: 11, top: 51, width: 34, rotate: 2 },
  wajihni: { left: 54, top: 49, width: 36, rotate: -2 },
};

/** Crop marks just outside each corner of the printed screen. */
const corners = [
  "-top-[0.9em] -left-[0.9em]",
  "-top-[0.9em] -right-[0.9em]",
  "-bottom-[0.9em] -left-[0.9em]",
  "-right-[0.9em] -bottom-[0.9em]",
];

/**
 * The artwork beside the Selected work intro, in the site's own dark-panel look: the same slow
 * light as the hero passes over the four projects, each printed on paper with crop marks. Every
 * print is a link into its scene; hovering it traces its screen in the project's colour.
 */
export function WorkIntroArt({ scenes }: { scenes: readonly ResolvedScene[] }) {
  return (
    <div
      data-reveal="clip"
      data-surface="dark"
      className="relative aspect-[16/10] overflow-hidden rounded-xl bg-foreground"
    >
      <div data-silk />
      <div data-panel-sheen aria-hidden="true" />
      <div data-reveal-inner className="absolute inset-0">
        {scenes.map((scene) => {
          const place = layout[scene.id];
          const capture = scene.captures[0];
          return (
            <a
              key={scene.id}
              href={`#scene-${scene.id}`}
              data-intro-print={scene.id}
              data-tone={scene.id}
              aria-label={`Go to ${scene.name}`}
              className="group absolute block bg-surface p-[2.4%] text-[clamp(0.4rem,0.62vw,0.8rem)] shadow-[0_1.5em_3em_-0.5em_color-mix(in_srgb,var(--color-foreground)_85%,transparent)] transition-[translate] duration-(--duration-base) ease-(--ease-standard) hover:-translate-y-[0.4em] focus-visible:-translate-y-[0.4em] focus-visible:outline-none"
              style={{
                left: `${place.left}%`,
                top: `${place.top}%`,
                width: `${place.width}%`,
                rotate: `${place.rotate}deg`,
              }}
            >
              <span className="relative block">
                {corners.map((corner) => (
                  <span
                    key={corner}
                    aria-hidden="true"
                    className={`absolute size-[1.8em] ${corner} before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:bg-foreground/60 after:absolute after:top-0 after:left-1/2 after:h-full after:w-px after:bg-foreground/60`}
                  />
                ))}
                <Image
                  src={capture.src}
                  width={capture.width}
                  height={capture.height}
                  alt=""
                  sizes="(min-width: 1024px) 24vw, 40vw"
                  className="block aspect-[16/10] h-auto w-full object-cover object-top"
                />
                <span
                  data-print-outline
                  aria-hidden="true"
                  className="absolute -inset-[0.35em] border-2 border-(--scene-accent) opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </span>
              <span
                aria-hidden="true"
                className="mt-[0.9em] flex items-center justify-between font-semibold tracking-[0.14em] text-foreground uppercase"
              >
                <span>
                  {scene.number} — {scene.name}
                </span>
                <span className="h-[1.1em] w-[2.4em] bg-(--scene-accent)" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
