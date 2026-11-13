import type { ResolvedScene } from "@/lib/projects/selected-work";
import { selectedWorkTiles } from "./smooth-erp-tiles";
import { ArtObject, Capture, Caption, Detail, Lines, Pill, Stage } from "./parts";

const RATIO = 1.6;
/** Lines are in stage units: 100 wide, 100 / RATIO tall. */
const y = (percent: number) => (percent * 100) / RATIO / 100;

/**
 * Smooth ERP: the ERP's own module tiles, cut from its home screen, arc over the point-of-sale
 * screen and feed into it; an Arabic report sits behind; the sale's "Payment and Print" button
 * is pulled out, and its receipt (the items on the capture) comes out beside it.
 */
export function SmoothErpArt({ scene }: { scene: ResolvedScene }) {
  const [pos, arabic, home] = scene.captures;
  const target = `64 ${y(30)}`;
  const feeds = [1, 3, 4, 6].map((index) => {
    const tile = selectedWorkTiles[index];
    const x = tile.left + 4.5;
    const from = y(tile.top + 9.5);
    return `M ${x} ${from} C ${x} ${from + 4} ${64 + (x - 64) * 0.3} ${y(30) - 3} ${target}`;
  });
  return (
    <Stage ratio={RATIO} align={{ x: "right", y: "bottom" }}>
      {selectedWorkTiles.map((tile, index) => (
        <div
          key={tile.name}
          className="absolute z-[3] animate-[art-bob_6s_ease-in-out_infinite]"
          style={{
            left: `${tile.left}%`,
            top: `${tile.top}%`,
            width: "9%",
            rotate: `${tile.rotate}deg`,
            animationDelay: `${index * -0.7}s`,
          }}
        >
          <Detail image={home} crop={tile.crop} box={{ left: 0, top: 0, width: 100 }} vw={5} />
        </div>
      ))}
      <Lines
        ratio={RATIO}
        draw={feeds}
        flow={feeds}
        travellers={[
          { path: feeds[0], duration: 2.6 },
          { path: feeds[3], duration: 2.9, delay: 1.2 },
        ]}
        dots={[[64, y(30)]]}
      />
      <Caption box={{ left: 4, top: 4 }}>{scene.captions.topic}</Caption>
      <Capture
        image={arabic}
        box={{ left: 9, top: 60, width: 27, rotate: -4, z: 1 }}
        sizes="(min-width: 1024px) 18vw, 40vw"
      />
      <Pill box={{ left: 11, top: 53 }} tone="frame">
        EN ⇄ AR
      </Pill>
      <Capture
        image={pos}
        href={scene.links[0].href}
        box={{ left: 32, top: 30, width: 64, z: 2 }}
        sizes="(min-width: 1024px) 44vw, 80vw"
      />
      <Detail
        image={pos}
        crop={{ x: 88.9, y: 94.6, w: 10.5, h: 4.6 }}
        box={{ left: 75, top: 90, width: 15, rotate: -2, z: 5 }}
        vw={8}
      />
      <ArtObject
        name="smooth-erp-receipt"
        box={{ left: 90, top: 46, width: 11, rotate: 7, z: 6 }}
      />
      <Caption box={{ left: 9, bottom: 0 }} tone="muted">
        {scene.captions.flow}
      </Caption>
    </Stage>
  );
}
