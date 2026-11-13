import Link from "next/link";
import type { ResolvedScene } from "@/lib/projects/selected-work";
import { SceneArt } from "./scene-art";
import { sceneLayouts, sceneLooks } from "./work-scene-looks";

/**
 * One Selected work scene: the project label, title, summary and case-study links, then its
 * artwork (captures, diagram lines and two captions) on the right. Scenes stack as full-width
 * bands, each in its own colour world; on wide screens with motion the stage pins them into one
 * panel instead (see WorkStage).
 */
export function WorkScene({ scene }: { scene: ResolvedScene }) {
  const look = sceneLooks[scene.id];
  const layout = sceneLayouts[look.layout];
  return (
    <li
      id={`scene-${scene.id}`}
      tabIndex={-1}
      data-scene={scene.id}
      data-tone={scene.id}
      data-surface={look.dark ? "dark" : undefined}
      aria-labelledby={`scene-${scene.id}-title`}
      data-layout={look.layout}
      className="relative grid overflow-hidden bg-(--scene-bg) px-gutter text-(--scene-ink) focus:outline-none lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10"
    >
      <div data-scene-texture={scene.id} aria-hidden="true" className="absolute inset-0" />
      <div
        data-scene-text
        className={`relative z-10 flex flex-col items-start gap-[clamp(1rem,1.6vw,1.75rem)] py-[clamp(2.5rem,5vw,4.5rem)] ${layout.text}`}
      >
        <p
          data-scene-part
          className={`text-label font-semibold tracking-[0.14em] text-(--scene-accent) uppercase ${layout.parts?.label ?? ""}`}
        >
          {scene.number} / {scene.label[0]} / {scene.label[1]}
        </p>
        <h3
          id={`scene-${scene.id}-title`}
          data-scene-title
          className={`text-[clamp(3.25rem,1.4rem+6.2vw,9.5rem)] leading-[1.04] font-semibold tracking-[-0.045em] text-(--scene-title) ${layout.parts?.title ?? ""}`}
        >
          <span className="border-b border-current pb-[0.04em] [box-decoration-break:clone]">
            {scene.name}
          </span>
        </h3>
        <p
          data-scene-part
          className={`max-w-[30ch] text-lead leading-[1.4] font-light text-(--scene-muted) ${layout.parts?.summary ?? ""}`}
        >
          {scene.summary}
        </p>
        <ul
          data-scene-part
          className={`flex flex-wrap gap-x-8 gap-y-3 ${layout.parts?.links ?? ""}`}
        >
          {scene.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block border-b border-(--scene-accent) pb-1 text-label font-semibold tracking-[0.14em] text-(--scene-ink) uppercase"
              >
                {link.label}
                {scene.links.length > 1 ? (
                  <span className="sr-only">, {scene.name}</span>
                ) : (
                  <span className="sr-only">: {scene.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        data-scene-art
        aria-hidden="true"
        className={`relative mb-[clamp(2rem,4vw,3.5rem)] aspect-[16/11] lg:mb-0 lg:aspect-auto lg:h-[min(72vh,46rem)] ${layout.art}`}
      >
        <SceneArt scene={scene} />
      </div>
    </li>
  );
}
