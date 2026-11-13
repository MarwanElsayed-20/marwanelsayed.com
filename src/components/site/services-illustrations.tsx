import type { ReactNode } from "react";
import type { ServiceId } from "@/content/site/services";

/*
 * One original vector scene per service, drawn in the site's own palette: ink, paper and the
 * lime highlight. They show the kind of thing built (a store, a site, a dashboard, a product
 * interface) in plain shapes: no text, no real project, no real capture. Each scene fills its
 * own box edge to edge; the frame that holds it rounds the corners.
 */

const ink = "var(--color-foreground)";
const card = "var(--color-surface)";
const lime = "var(--color-highlight)";
const soft = "color-mix(in srgb, var(--color-foreground) 8%, transparent)";
const mid = "color-mix(in srgb, var(--color-foreground) 22%, transparent)";
const edge = "color-mix(in srgb, var(--color-foreground) 16%, transparent)";
const faint = "color-mix(in srgb, var(--color-surface) 20%, transparent)";
const faintStrong = "color-mix(in srgb, var(--color-surface) 42%, transparent)";

type Paint = { fill?: string; stroke?: string; sw?: number };

function Box({
  x,
  y,
  w,
  h,
  r = 0,
  fill = "none",
  stroke,
  sw = 1.5,
}: Paint & { x: number; y: number; w: number; h: number; r?: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      style={{ fill, stroke, strokeWidth: stroke ? sw : undefined }}
    />
  );
}

/** A rounded bar: a line of text or a label, as a plain shape. */
function Bar(props: { x: number; y: number; w: number; h: number } & Paint) {
  return <Box {...props} r={props.h / 2} />;
}

function Dot({
  cx,
  cy,
  r,
  fill = "none",
  stroke,
  sw = 1.5,
}: Paint & { cx: number; cy: number; r: number }) {
  return (
    <circle cx={cx} cy={cy} r={r} style={{ fill, stroke, strokeWidth: stroke ? sw : undefined }} />
  );
}

function Line({
  d,
  stroke = ink,
  sw = 3,
  fill = "none",
}: {
  d: string;
  stroke?: string;
  sw?: number;
  fill?: string;
}) {
  return (
    <path
      d={d}
      style={{
        fill,
        stroke,
        strokeWidth: sw,
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
    />
  );
}

/** A shop: a product with a sticker, a cart button that has been pressed, and the cart's badge. */
function Store() {
  return (
    <>
      <Box x={0} y={0} w={300} h={380} fill={card} />
      <Bar x={16} y={16} w={58} h={8} fill={ink} />
      <Bar x={88} y={18} w={26} h={5} fill={mid} />
      <Bar x={122} y={18} w={26} h={5} fill={mid} />
      <Dot cx={262} cy={20} r={12} fill={ink} />
      <Line d="M255 17h3l2 8h9l2-6h-14" stroke={card} sw={1.8} />
      <Dot cx={274} cy={11} r={5} fill={lime} />
      <Box x={16} y={44} w={268} h={154} r={10} fill={soft} />
      <Box x={26} y={54} w={46} h={18} r={9} fill={lime} />
      <Bar x={34} y={61} w={30} h={4} fill={ink} />
      <Box x={112} y={90} w={76} h={80} r={8} fill={ink} />
      <Line d="M134 94v-8a16 16 0 0 1 32 0v8" sw={5} />
      <Dot cx={150} cy={132} r={10} fill={lime} />
      <Bar x={16} y={214} w={150} h={11} fill={ink} />
      <Bar x={16} y={234} w={104} h={8} fill={mid} />
      <Bar x={208} y={214} w={76} h={14} fill={ink} />
      {[0, 1, 2, 3].map((star) => (
        <Dot key={star} cx={22 + star * 15} cy={258} r={5} fill={lime} />
      ))}
      <Dot cx={82} cy={258} r={5} fill={mid} />
      <Box x={16} y={282} w={172} h={38} r={19} fill={ink} />
      <Bar x={62} y={297} w={80} h={8} fill={card} />
      <Box x={198} y={282} w={86} h={38} r={19} fill={lime} />
      <Line d="M228 301l8 8 15-17" sw={3.4} />
      {[16, 90, 164].map((x) => (
        <Box key={x} x={x} y={334} w={62} h={30} r={8} fill={soft} />
      ))}
      <Box x={238} y={334} w={46} h={30} r={8} stroke={edge} />
      <Line d="M261 343v12M255 349h12" stroke={mid} sw={2} />
    </>
  );
}

/** A marketing site: a dark hero with a call to action, three feature cards and a sign-up strip. */
function Website() {
  return (
    <>
      <Box x={0} y={0} w={520} h={340} fill={card} />
      {[20, 34, 48].map((cx) => (
        <Dot key={cx} cx={cx} cy={18} r={4} fill={mid} />
      ))}
      <Bar x={120} y={9} w={280} h={18} fill={soft} />
      <Box x={0} y={36} w={520} h={150} fill={ink} />
      <Bar x={36} y={68} w={250} h={18} fill={card} />
      <Bar x={36} y={96} w={190} h={18} fill={card} />
      <Bar x={36} y={128} w={160} h={7} fill={faintStrong} />
      <Bar x={36} y={142} w={120} h={7} fill={faintStrong} />
      <Box x={36} y={158} w={96} h={22} r={11} fill={lime} />
      <Bar x={54} y={166} w={60} h={6} fill={ink} />
      <Box x={142} y={158} w={78} h={22} r={11} stroke={faintStrong} />
      <Dot cx={420} cy={112} r={54} stroke={faint} />
      <Dot cx={420} cy={112} r={36} stroke={faintStrong} />
      <Dot cx={420} cy={112} r={17} fill={lime} />
      {[28, 186, 344].map((x, index) => (
        <g key={x}>
          <Box x={x} y={206} w={148} h={92} r={10} fill={soft} />
          <Dot cx={x + 24} cy={230} r={9} fill={index === 1 ? ink : lime} />
          <Bar x={x + 14} y={252} w={90} h={8} fill={ink} />
          <Bar x={x + 14} y={268} w={120} h={6} fill={mid} />
          <Bar x={x + 14} y={280} w={80} h={6} fill={mid} />
        </g>
      ))}
      <Box x={28} y={310} w={240} h={20} r={10} stroke={edge} />
      <Bar x={42} y={318} w={90} h={4} fill={mid} />
      <Box x={278} y={310} w={64} h={20} r={10} fill={ink} />
    </>
  );
}

/** A dashboard: navigation, three figures, a bar chart with a trend line, a donut and a table. */
function Dashboard() {
  const heights = [26, 40, 34, 54, 46, 68, 58, 82, 70, 96];
  const tops = heights.map(
    (h, index) => `${index === 0 ? "M" : "L"}${142 + index * 22} ${252 - h}`,
  );
  return (
    <>
      <Box x={0} y={0} w={520} h={340} fill={card} />
      <Box x={0} y={0} w={100} h={340} fill={ink} />
      <Dot cx={24} cy={26} r={7} fill={lime} />
      <Bar x={38} y={23} w={40} h={6} fill={card} />
      <Bar x={18} y={68} w={56} h={6} fill={faint} />
      <Box x={8} y={92} w={84} h={22} r={11} fill={lime} />
      <Bar x={20} y={100} w={50} h={6} fill={ink} />
      <Bar x={18} y={132} w={48} h={6} fill={faint} />
      <Bar x={18} y={160} w={60} h={6} fill={faint} />
      <Bar x={18} y={188} w={44} h={6} fill={faint} />
      <Bar x={120} y={22} w={130} h={12} fill={ink} />
      <Bar x={120} y={42} w={80} h={7} fill={mid} />
      <Dot cx={488} cy={30} r={11} fill={soft} />
      {[0, 1, 2].map((index) => {
        const x = 120 + index * 130;
        return (
          <g key={x}>
            <Box x={x} y={62} w={120} h={62} r={10} fill={soft} />
            <Bar x={x + 12} y={74} w={50} h={6} fill={mid} />
            <Bar x={x + 12} y={88} w={70} h={14} fill={ink} />
            <Bar x={x + 12} y={108} w={34} h={10} fill={index === 1 ? mid : lime} />
          </g>
        );
      })}
      <Box x={120} y={138} w={250} h={138} r={10} stroke={edge} />
      <Bar x={134} y={150} w={80} h={7} fill={ink} />
      {heights.map((h, index) => (
        <Box
          key={index}
          x={136 + index * 22}
          y={262 - h}
          w={13}
          h={h}
          r={3}
          fill={index === heights.length - 1 ? ink : mid}
        />
      ))}
      <Line d={tops.join("")} stroke={lime} sw={3.4} />
      <Box x={380} y={138} w={120} h={138} r={10} fill={soft} />
      <Dot cx={440} cy={192} r={28} stroke={card} sw={12} />
      <circle
        cx={440}
        cy={192}
        r={28}
        transform="rotate(-90 440 192)"
        style={{
          fill: "none",
          stroke: ink,
          strokeWidth: 12,
          strokeDasharray: "104 72",
        }}
      />
      <circle
        cx={440}
        cy={192}
        r={28}
        transform="rotate(130 440 192)"
        style={{
          fill: "none",
          stroke: lime,
          strokeWidth: 12,
          strokeDasharray: "46 130",
        }}
      />
      <Bar x={396} y={240} w={44} h={6} fill={ink} />
      <Bar x={396} y={254} w={64} h={6} fill={mid} />
      {[290, 312].map((y, index) => (
        <g key={y}>
          <Bar x={120} y={y + 3} w={index === 0 ? 96 : 72} h={7} fill={ink} />
          <Bar x={250} y={y + 3} w={60} h={7} fill={mid} />
          <Box x={330} y={y - 1} w={44} h={14} r={7} fill={index === 0 ? lime : mid} />
          <Bar x={392} y={y + 3} w={70} h={7} fill={mid} />
        </g>
      ))}
    </>
  );
}

/** A product interface: module tiles, a chat thread, a step flow and role chips. */
function Product() {
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const glyph = (index: number, cx: number, cy: number) => {
    switch (index) {
      case 0:
        return <Dot cx={cx} cy={cy} r={10} fill={ink} />;
      case 1:
        return <Box x={cx - 10} y={cy - 10} w={20} h={20} r={5} fill={ink} />;
      case 2:
        return (
          <>
            <Bar x={cx - 12} y={cy - 9} w={24} h={5} fill={ink} />
            <Bar x={cx - 12} y={cy - 1} w={16} h={5} fill={ink} />
            <Bar x={cx - 12} y={cy + 7} w={20} h={5} fill={ink} />
          </>
        );
      case 3:
        return <Line d={`M${cx - 11} ${cy + 9}l11 -19 11 19z`} stroke={ink} sw={3} fill={ink} />;
      case 4:
        return (
          <>
            <Dot cx={cx} cy={cy} r={13} fill={lime} />
            <Line d={`M${cx - 6} ${cy}l4 4 8-9`} sw={2.6} />
          </>
        );
      case 5:
        return <Box x={cx - 11} y={cy - 9} w={22} h={18} r={5} stroke={ink} sw={3} />;
      case 6:
        return (
          <>
            <Dot cx={cx - 7} cy={cy} r={6} fill={ink} />
            <Dot cx={cx + 7} cy={cy} r={6} fill={mid} />
          </>
        );
      case 7:
        return <Line d={`M${cx - 11} ${cy + 6}l7 -9 6 5 9 -10`} sw={3.2} />;
      default:
        return <Dot cx={cx} cy={cy} r={9} stroke={ink} sw={3} />;
    }
  };
  return (
    <>
      <Box x={0} y={0} w={400} h={340} fill={card} />
      {tiles.map((index) => {
        const x = 16 + (index % 3) * 72;
        const y = 20 + Math.floor(index / 3) * 72;
        const active = index === 4;
        return (
          <g key={index}>
            <Box x={x} y={y} w={64} h={64} r={10} fill={active ? ink : soft} />
            {glyph(index, x + 32, y + 26)}
            <Bar x={x + 14} y={y + 50} w={36} h={5} fill={active ? faintStrong : mid} />
          </g>
        );
      })}
      <Box x={244} y={20} w={140} h={208} r={12} fill={ink} />
      <Box x={256} y={36} w={84} h={22} r={11} fill={faint} />
      <Box x={288} y={66} w={84} h={22} r={11} fill={lime} />
      <Box x={256} y={96} w={64} h={22} r={11} fill={faint} />
      <Box x={300} y={126} w={72} h={22} r={11} fill={lime} />
      <Box x={256} y={156} w={52} h={22} r={11} fill={faint} />
      {[270, 282, 294].map((cx) => (
        <Dot key={cx} cx={cx} cy={167} r={2.6} fill={card} />
      ))}
      <Box x={256} y={192} w={116} h={24} r={12} stroke={faintStrong} />
      <Box x={40} y={266} w={320} h={2} fill={mid} />
      <Box x={40} y={266} w={160} h={2} fill={ink} />
      <Dot cx={40} cy={267} r={12} fill={ink} />
      <Line d="M34 267l4 4 8-9" stroke={card} sw={2.4} />
      <Dot cx={200} cy={267} r={12} fill={lime} />
      <Dot cx={200} cy={267} r={4} fill={ink} />
      <Dot cx={360} cy={267} r={12} fill={card} stroke={mid} sw={2} />
      <Bar x={20} y={290} w={40} h={5} fill={ink} />
      <Bar x={180} y={290} w={40} h={5} fill={mid} />
      <Bar x={340} y={290} w={40} h={5} fill={mid} />
      <Box x={16} y={308} w={52} h={18} r={9} fill={lime} />
      <Box x={76} y={308} w={52} h={18} r={9} fill={soft} />
      <Box x={136} y={308} w={52} h={18} r={9} fill={soft} />
    </>
  );
}

type Scene = {
  /** Width and height of the whole scene. */
  size: readonly [number, number];
  /** A 4:3 detail of it for the list's tile: x, y, width, height. */
  tile: string;
  draw: () => ReactNode;
};

const scenes: Record<ServiceId, Scene> = {
  "online-stores": { size: [300, 380], tile: "10 38 280 210", draw: Store },
  websites: { size: [520, 340], tile: "0 36 360 270", draw: Website },
  dashboards: { size: [520, 340], tile: "100 40 400 300", draw: Dashboard },
  "saas-erp": { size: [400, 340], tile: "0 10 400 300", draw: Product },
};

/** Width over height of a service's whole scene. */
export function sceneRatio(id: ServiceId): number {
  const [width, height] = scenes[id].size;
  return width / height;
}

/** A service's illustration, whole (the plate) or as a 4:3 detail (the list's tile). */
export function ServiceIllustration({ id, tile = false }: { id: ServiceId; tile?: boolean }) {
  const scene = scenes[id];
  const [width, height] = scene.size;
  return (
    <svg
      viewBox={tile ? scene.tile : `0 0 ${width} ${height}`}
      data-print-picture
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-full"
    >
      {scene.draw()}
    </svg>
  );
}
