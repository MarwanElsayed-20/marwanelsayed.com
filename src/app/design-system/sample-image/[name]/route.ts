import { reviewPagesEnabled } from "@/lib/review-pages";

// Review-only. The switch is read on every request, like the review layout.
export const dynamic = "force-dynamic";

const OPEN = '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sample line drawing"';
const STROKE = 'fill="none" stroke="CanvasText" stroke-width="2"';

/** A wide, dense stand-in for a dashboard: panels, a sidebar, bars, and table rules. No text. */
function dashboardDrawing(): string {
  const parts: string[] = [
    '<rect x="20" y="20" width="1560" height="960"/>',
    '<line x1="20" y1="90" x2="1580" y2="90"/>',
    '<line x1="300" y1="90" x2="300" y2="980"/>',
  ];
  for (let i = 0; i < 12; i += 1) {
    parts.push(`<rect x="40" y="${120 + i * 56}" width="220" height="30"/>`);
  }
  for (let i = 0; i < 4; i += 1) {
    parts.push(`<rect x="${330 + i * 310}" y="120" width="290" height="110"/>`);
  }
  parts.push('<rect x="330" y="260" width="900" height="300"/>');
  for (let i = 0; i < 30; i += 1) {
    const height = 30 + ((i * 37) % 200);
    parts.push(`<rect x="${345 + i * 29}" y="${545 - height}" width="16" height="${height}"/>`);
  }
  parts.push('<rect x="1260" y="260" width="300" height="300"/>');
  parts.push('<circle cx="1410" cy="410" r="110"/>');
  parts.push('<rect x="330" y="590" width="1230" height="370"/>');
  for (let i = 0; i < 11; i += 1) {
    parts.push(`<line x1="330" y1="${620 + i * 32}" x2="1560" y2="${620 + i * 32}"/>`);
  }
  for (let i = 0; i < 7; i += 1) {
    parts.push(`<line x1="${420 + i * 170}" y1="590" x2="${420 + i * 170}" y2="960"/>`);
  }
  return parts.join("");
}

/** A tall, narrow stand-in for a phone-sized product screen. */
function narrowDrawing(): string {
  const parts: string[] = [
    '<rect x="20" y="20" width="710" height="1294"/>',
    '<line x1="20" y1="110" x2="730" y2="110"/>',
    '<rect x="50" y="140" width="650" height="180"/>',
  ];
  for (let i = 0; i < 8; i += 1) {
    parts.push(`<rect x="50" y="${350 + i * 110}" width="650" height="90"/>`);
    parts.push(`<circle cx="100" cy="${395 + i * 110}" r="26"/>`);
  }
  parts.push('<line x1="20" y1="1230" x2="730" y2="1230"/>');
  return parts.join("");
}

const images: Record<string, string> = {
  "one.svg": `${OPEN} viewBox="0 0 800 500" width="800" height="500"><g ${STROKE}><rect x="40" y="40" width="720" height="420"/><circle cx="250" cy="250" r="120"/><path d="M400 380 L560 120 L720 380 Z"/></g></svg>`,
  "two.svg": `${OPEN} viewBox="0 0 800 600" width="800" height="600"><g ${STROKE}><rect x="40" y="40" width="720" height="520"/><path d="M40 420 L260 240 L420 360 L560 200 L760 400"/><circle cx="620" cy="130" r="50"/></g></svg>`,
  "three.svg": `${OPEN} viewBox="0 0 600 800" width="600" height="800"><g ${STROKE}><rect x="40" y="40" width="520" height="720"/><path d="M40 600 L300 300 L560 600"/><circle cx="300" cy="190" r="80"/></g></svg>`,
  "dashboard.svg": `${OPEN} viewBox="0 0 1600 1000" width="1600" height="1000"><g ${STROKE}>${dashboardDrawing()}</g></svg>`,
  "screen-narrow.svg": `${OPEN} viewBox="0 0 750 1334" width="750" height="1334"><g ${STROKE}>${narrowDrawing()}</g></svg>`,
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
): Promise<Response> {
  if (!reviewPagesEnabled(process.env)) return new Response("Not found", { status: 404 });
  const { name } = await context.params;
  const svg = Object.hasOwn(images, name) ? images[name] : undefined;
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
