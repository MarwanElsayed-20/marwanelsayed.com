import type { ResolvedScene } from "@/lib/projects/selected-work";
import { WorkScene } from "./work-scene";
import { WorkStageMotion } from "./work-stage-motion";

/**
 * The Selected work stage. On wide screens with motion it is one pinned panel: a hairline in the
 * four project colours, "Selected work" and a counter, the scenes changing in the middle, a
 * scroll label at the edge and tabs along the bottom, filling the screen edge to edge inside a
 * hairline frame (see the pinned rules in globals.css). Elsewhere the scenes stack as full-width
 * bands and the panel chrome stays hidden.
 */
export function WorkStage({ scenes }: { scenes: readonly ResolvedScene[] }) {
  const total = String(scenes.length).padStart(2, "0");
  return (
    <WorkStageMotion count={scenes.length}>
      <div data-work-panel>
        <div data-work-card data-tone={scenes[0].id} className="relative">
          <div data-work-hairline aria-hidden="true" className="hidden">
            {scenes.map((scene) => (
              <span key={scene.id} data-hairline={scene.id} data-tone={scene.id} />
            ))}
          </div>
          <div
            data-work-top
            aria-hidden="true"
            className="hidden text-label font-semibold tracking-[0.14em] uppercase"
          >
            <span>Selected work</span>
            <span className="tabular-nums">
              <span data-work-count>{scenes[0].number}</span>/{total}
            </span>
          </div>
          <ol data-work-scenes className="flex flex-col">
            {scenes.map((scene) => (
              <WorkScene key={scene.id} scene={scene} />
            ))}
          </ol>
          <div data-work-scroll aria-hidden="true" className="hidden">
            <span className="text-label font-semibold tracking-[0.14em] uppercase">Scroll</span>
          </div>
          <nav data-work-tabs aria-label="Selected work projects" className="hidden">
            <ol className="grid grid-cols-4 gap-x-[clamp(1rem,2vw,2.5rem)]">
              {scenes.map((scene) => (
                <li key={scene.id}>
                  <a
                    href={`#scene-${scene.id}`}
                    data-work-tab={scene.id}
                    className="relative block pt-[clamp(0.75rem,1.1vw,1.1rem)] text-label font-semibold tracking-[0.14em] uppercase"
                  >
                    <span data-tab-progress aria-hidden="true" />
                    <span className="tabular-nums">{scene.number}</span> {scene.tab}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div data-work-wash aria-hidden="true" className="hidden" />
        </div>
      </div>
    </WorkStageMotion>
  );
}
