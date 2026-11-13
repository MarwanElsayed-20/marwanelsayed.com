import type { ResolvedScene } from "@/lib/projects/selected-work";
import { ArtObject, Capture, Caption, Detail, Lines, Pill, Stage } from "./parts";

const RATIO = 1.4;

/**
 * ToolSwift as an ecosystem: the admin platform and the marketing site feed the customer portal
 * through the headless core (the real ToolSwift mark), along amber lines that dots travel. A
 * product card is pulled out of the portal, and the buyer's journey runs beneath it as steps.
 * Lines are in stage units: 100 wide, 100 / RATIO tall.
 */
export function ToolSwiftArt({ scene }: { scene: ResolvedScene }) {
  const [portal, admin, marketing] = scene.captures;
  const fromAdmin = "M 30 34.5 C 33 40 40 35 44 37";
  const fromMarketing = "M 30 40 C 33 37 40 40 44 38.5";
  const toPortal = "M 53 37.7 L 57 37.7";
  const journey = "M 56 61.5 L 97 61.5";
  return (
    <Stage ratio={RATIO} align={{ x: "right", y: "centre" }}>
      <Caption box={{ left: 0, top: 0 }}>{scene.captions.topic}</Caption>
      <Capture image={admin} box={{ left: 0, top: 7, width: 44, rotate: -2, z: 1 }} />
      <Capture
        image={marketing}
        box={{ left: 3, top: 56, width: 37, rotate: 2, z: 1 }}
        sizes="(min-width: 1024px) 24vw, 45vw"
      />
      <Capture
        image={portal}
        href={scene.links[0].href}
        box={{ left: 57, top: 21, width: 62, z: 2 }}
        sizes="(min-width: 1024px) 40vw, 80vw"
      />
      <Lines
        ratio={RATIO}
        draw={[fromAdmin, fromMarketing, toPortal, journey]}
        flow={[fromAdmin, fromMarketing]}
        travellers={[
          { path: fromAdmin, duration: 2.4 },
          { path: fromMarketing, duration: 2.8, delay: 1.1 },
          { path: journey, duration: 5 },
        ]}
        dots={[
          [30, 34.5],
          [30, 40],
          [97, 61.5],
        ]}
      />
      {/* The headless core: the real ToolSwift mark, lifted out of the portal's header. */}
      <div
        data-art-piece
        className="absolute z-[4] rounded-full bg-surface px-[1.3cqw] py-[0.8cqw] shadow-[0_0_0_0.5cqw_color-mix(in_srgb,var(--scene-accent)_30%,transparent),0_1.5cqw_3cqw_-1cqw_color-mix(in_srgb,var(--color-foreground)_70%,transparent)]"
        style={{ left: "43%", top: "48%", width: "13%" }}
      >
        <Detail image={portal} crop={{ x: 3.6, y: 2.4, w: 8.6, h: 3.9 }} box={{}} vw={6} bare />
      </div>
      <Detail
        image={portal}
        crop={{ x: 36.5, y: 29.4, w: 13.9, h: 46.6 }}
        box={{ left: 86, top: 3, width: 11, rotate: 4, z: 5 }}
        vw={6}
      />
      <Pill box={{ left: 57, top: 82 }} tone="outline">
        Catalogue
      </Pill>
      <Pill box={{ left: 70, top: 82 }} tone="outline">
        Cart
      </Pill>
      <Pill box={{ left: 78, top: 82 }} tone="outline">
        Quote
      </Pill>
      <Pill box={{ left: 87, top: 82 }} tone="accent">
        Payment
      </Pill>
      <ArtObject name="toolswift-bolt" box={{ left: 41, top: 77, width: 13, z: 6 }} />
      <Caption box={{ right: 0, bottom: 0 }} tone="muted">
        {scene.captions.flow}
      </Caption>
    </Stage>
  );
}
