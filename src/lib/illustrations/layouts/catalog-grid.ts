import type { IllustrationFacts } from "../types";
import type { Composition } from "../compose";
export function catalogGrid(f: IllustrationFacts): Composition {
  const name = f.texts.find((t) => t.role === "name")!;
  const nav = f.texts.filter((t) => t.role !== "name");
  const result: Composition = {
    shapes: [{ x: 0, y: 0, width: 1600, height: 200, colour: "accent" }],
    lettering: [{ text: name.text, x: 64, y: 64, width: 1472, fontSizePx: 68, colour: "surface" }],
  };
  nav.forEach((t, i) =>
    result.lettering.push({ text: t.text, x: 64 + i * 500, y: 256, width: 464, fontSizePx: 48 }),
  );
  for (let col = 0; col < 3; col++)
    for (let row = 0; row < 2; row++) {
      const x = 64 + col * 500,
        y = 372 + row * 292;
      result.shapes.push(
        { x, y, width: 468, height: 252, colour: "accent", opacity: 0.1 },
        {
          x: x + 40,
          y: y + 40,
          width: col === 1 ? 124 : 200,
          height: col === 1 ? 124 : 76,
          colour: "accent",
          opacity: col === 1 ? 0.8 : 0.4,
        },
        { x: x + 40, y: y + 194, width: 300, height: 20, colour: "ink", opacity: 0.16 },
      );
    }
  return result;
}
