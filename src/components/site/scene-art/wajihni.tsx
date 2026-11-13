import type { ResolvedScene } from "@/lib/projects/selected-work";
import { ArtObject, Capture, Caption, Detail, Lines, Pill, Stage } from "./parts";

const RATIO = 1.45;
const H = 100 / RATIO;

/** The skills on the applicants screen, and what a company sets on a training programme. */
const skills =
  "REACT · TYPESCRIPT · CSS · SQL · PYTHON · FIGMA · RESEARCH · NODE.JS · MONGODB · EXPRESS · COPYWRITING · SEO · NEXT.JS · TAILWIND · ";
const programme = "PROGRAMMES · DURATION · CATEGORY · CAPACITY · APPLICANTS · ";

const studentRibbon = `M -6 ${H * 0.86} C 18 ${H * 0.72} 40 ${H * 0.9} 60 ${H * 0.64} S 90 ${H * 0.26} 108 ${H * 0.36}`;
const companyRibbon = `M -6 ${H * 0.4} C 16 ${H * 0.56} 40 ${H * 0.42} 60 ${H * 0.66} S 88 ${H * 0.92} 108 ${H * 0.8}`;

/** A wide band along a path, with words running along it. */
function Ribbon({
  id,
  d,
  words,
  tone,
}: {
  id: string;
  d: string;
  words: string;
  tone: "accent" | "ink";
}) {
  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        strokeWidth={4.2}
        strokeLinecap="round"
        className={tone === "accent" ? "stroke-(--scene-accent)" : "stroke-(--scene-ink)/85"}
      />
      <text dy={0.55} className="fill-(--scene-bg) text-[1.55px] font-bold tracking-[0.24em]">
        <textPath href={`#${id}`}>{words.repeat(3)}</textPath>
      </text>
    </>
  );
}

/**
 * Wajihni: two ribbons cross, the students' (carrying the real skills from the applicants screen)
 * and the companies' (what a programme holds), behind the landing page; its "Join as a company"
 * and "Join as a student" cards are pulled out where they meet. An application goes from pending
 * to accepted beside the company's applicants list, and the student badge lies in front.
 */
export function WajihniArt({ scene }: { scene: ResolvedScene }) {
  const [landing, applicants] = scene.captures;
  const decision = `M 14 ${H * 0.9} L 26 ${H * 0.9}`;
  return (
    <Stage ratio={RATIO} align={{ x: "right", y: "centre" }}>
      <Caption box={{ left: 42, top: 0 }}>{scene.captions.topic}</Caption>
      <Capture
        image={applicants}
        box={{ left: 0, top: 10, width: 38, rotate: -3, z: 1 }}
        sizes="(min-width: 1024px) 24vw, 45vw"
      />
      <Capture
        image={landing}
        href={scene.links[0].href}
        box={{ left: 42, top: 6, width: 62, z: 2 }}
        sizes="(min-width: 1024px) 40vw, 80vw"
      />
      <svg
        data-art-piece
        aria-hidden="true"
        viewBox={`0 0 100 ${H}`}
        className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-visible"
      >
        <Ribbon id="wajihni-company" d={companyRibbon} words={programme} tone="ink" />
        <Ribbon id="wajihni-student" d={studentRibbon} words={skills} tone="accent" />
      </svg>
      <Detail
        image={landing}
        crop={{ x: 22.9, y: 42.7, w: 26.7, h: 28.75 }}
        box={{ left: 30, top: 50, width: 22, rotate: -4, z: 4 }}
        vw={14}
      />
      <Detail
        image={landing}
        crop={{ x: 50.4, y: 42.7, w: 26.7, h: 28.75 }}
        box={{ left: 54, top: 54, width: 23, rotate: 3, z: 5 }}
        vw={14}
      />
      <Lines
        ratio={RATIO}
        draw={[decision]}
        travellers={[{ path: decision, duration: 1.8 }]}
        dots={[[26, H * 0.9]]}
      />
      <Pill box={{ left: 3, top: 86 }} tone="outline">
        Pending
      </Pill>
      <Pill box={{ left: 27, top: 86 }} tone="accent">
        Accepted
      </Pill>
      <ArtObject name="wajihni-badge" box={{ left: 80, top: 66, width: 20, z: 6 }} />
      <Caption box={{ left: 3, bottom: 0 }} tone="muted">
        {scene.captions.flow}
      </Caption>
    </Stage>
  );
}
