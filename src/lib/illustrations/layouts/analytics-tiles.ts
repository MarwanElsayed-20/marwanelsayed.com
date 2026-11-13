import type { IllustrationFacts } from "../types";
import type { Composition } from "../compose";
export function analyticsTiles(f: IllustrationFacts): Composition {
  const name = f.texts.find((t) => t.role === "name")!;
  const nav = f.texts.filter((t) => t.role !== "name");
  const result: Composition = {
    shapes: [{ x: 64, y: 196, width: 64, height: 740, colour: "accent" }],
    lettering: [{ text: name.text, x: 64, y: 60, width: 1472, fontSizePx: 72 }],
  };
  nav.forEach((t, i) => {
    const x = 184 + (i % 2) * 688,
      y = 212 + Math.floor(i / 2) * 368;
    result.shapes.push({ x, y, width: 640, height: 320, colour: "accent", opacity: 0.08 });
    result.lettering.push({ text: t.text, x: x + 32, y: y + 32, width: 576, fontSizePx: 44 });
    for (let bar = 0; bar < 3; bar++)
      result.shapes.push({
        x: x + 32,
        y: y + 140 + bar * 48,
        width: 480 - bar * 96,
        height: 20,
        colour: "accent",
        opacity: 0.7 - bar * 0.2,
      });
  });
  return result;
}
