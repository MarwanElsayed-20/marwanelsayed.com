import type { ResolvedScene } from "@/lib/projects/selected-work";
import { ArtObject, Capture, Caption, Detail, Lines, Pill, Stage, type Box, place } from "./parts";

const RATIO = 2.6;
const H = 100 / RATIO;

/** The case journey, a soft road across the band (stage units: 100 wide, 100 / RATIO tall). */
const road = "M -2 35 C 8 35 12 30 22 30 S 36 35.5 46 33 S 62 27 72 29 S 90 34 102 31";

/** A chat message: a rounded bubble with lines standing in for its text. */
function Bubble({ box, sent, delay }: { box: Box; sent?: boolean; delay: number }) {
  return (
    <div
      className={`absolute flex flex-col gap-[0.5cqw] rounded-[1.1cqw] px-[1.1cqw] py-[0.9cqw] shadow-[0_1cqw_2cqw_-0.8cqw_color-mix(in_srgb,var(--color-foreground)_40%,transparent)] animate-[bubble-pop_7s_ease-in-out_infinite] ${
        sent
          ? "rounded-br-[0.2cqw] bg-(--scene-accent)"
          : "rounded-bl-[0.2cqw] bg-(--scene-frame) ring-1 ring-(--scene-line)"
      }`}
      style={{ ...place(box), animationDelay: `${delay}s` }}
    >
      {[100, 70].map((width) => (
        <span
          key={width}
          className={`h-[0.45cqw] rounded-full ${sent ? "bg-(--scene-bg)/70" : "bg-(--scene-line)"}`}
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Aligna: a case's journey as a road across the band, from "Add New Case" through the wizard's
 * three stages (prescription, uploads, clinic and shipping) to the dashboard, where a case
 * "Needs Approval" (cut from the case page) and the real-time chat picks it up; the aligner case
 * waits at the end.
 */
export function AlignaArt({ scene }: { scene: ResolvedScene }) {
  const [dashboard, details] = scene.captures;
  // From the dashboard's submissions trend, out to a case's pulled-out status.
  const toChip = "M 74.2 20 C 76 22 78 24 80 25.4";
  return (
    <Stage ratio={RATIO} align={{ x: "centre", y: "bottom" }}>
      <svg
        data-art-piece
        aria-hidden="true"
        viewBox={`0 0 100 ${H}`}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d={road}
          fill="none"
          strokeWidth={2.2}
          strokeLinecap="round"
          className="stroke-(--scene-frame)"
        />
        <path
          d={road}
          fill="none"
          strokeWidth={0.14}
          strokeDasharray="0.9 0.9"
          className="stroke-(--scene-accent)"
        />
      </svg>
      <Detail
        image={dashboard}
        crop={{ x: 87, y: 6.7, w: 11.3, h: 4.8 }}
        box={{ left: 1, top: 85, width: 8, rotate: -2, z: 4 }}
        vw={6}
      />
      <Capture
        image={details}
        box={{ left: 4, top: 50, width: 20, rotate: -3, z: 1 }}
        sizes="(min-width: 1024px) 18vw, 40vw"
      />
      <Pill box={{ left: 27, top: 66 }} tone="outline">
        01 · Prescription
      </Pill>
      <Pill box={{ left: 36, top: 86 }} tone="outline">
        02 · Uploads
      </Pill>
      <Pill box={{ left: 46, top: 70 }} tone="accent">
        03 · Clinic &amp; shipping
      </Pill>
      <Caption box={{ right: 0, top: 0 }}>{scene.captions.topic}</Caption>
      <Capture
        image={dashboard}
        href={scene.links[0].href}
        box={{ left: 58, top: 24, width: 27, z: 2 }}
        sizes="(min-width: 1024px) 30vw, 60vw"
      />
      <Lines
        ratio={RATIO}
        draw={[toChip]}
        travellers={[{ path: road, duration: 10 }]}
        dots={[[80, 25.4]]}
      />
      <Detail
        image={details}
        crop={{ x: 38.6, y: 15.3, w: 7.6, h: 2.9 }}
        box={{ left: 79, top: 66, width: 8, rotate: 3, z: 5 }}
        vw={7}
      />
      <Bubble box={{ left: 89, top: 8, width: 9 }} delay={0} />
      <Bubble box={{ left: 91, top: 24, width: 7 }} sent delay={1.2} />
      <div
        className="absolute flex gap-[0.45cqw] rounded-full bg-(--scene-frame) px-[0.9cqw] py-[0.7cqw] ring-1 ring-(--scene-line)"
        style={place({ left: 89, top: 38 })}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-[0.45cqw] animate-[typing_1.2s_ease-in-out_infinite] rounded-full bg-(--scene-muted)"
            style={{ animationDelay: `${dot * 0.18}s` }}
          />
        ))}
      </div>
      <ArtObject name="aligna-aligner" box={{ left: 87, top: 54, width: 11, z: 6 }} />
      <Caption box={{ left: 11, bottom: 0 }} tone="muted">
        {scene.captions.flow}
      </Caption>
    </Stage>
  );
}
