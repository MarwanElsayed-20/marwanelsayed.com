import type { IllustrationFacts } from "../types";
import type { Composition } from "../compose";
export function erpPos(f: IllustrationFacts): Composition {
  const name = f.texts.find((t) => t.role === "name")!;
  const nav = f.texts.filter((t) => t.role !== "name");
  const result: Composition = {
    shapes: [
      { x: 0, y: 0, width: 24, height: 1000, colour: "accent" },
      { x: 56, y: 180, width: 364, height: 764, colour: "ink", opacity: 0.06 },
      { x: 464, y: 180, width: 592, height: 112, colour: "accent" },
      { x: 1096, y: 180, width: 448, height: 764, colour: "ink", opacity: 0.06 },
    ],
    lettering: [{ text: name.text, x: 64, y: 60, width: 1472, fontSizePx: 72 }],
  };
  nav.forEach((t, i) =>
    result.lettering.push({ text: t.text, x: 84, y: 224 + i * 158, width: 308, fontSizePx: 44 }),
  );
  for (let row = 0; row < 4; row++) {
    result.shapes.push(
      { x: 488, y: 348 + row * 140, width: 432, height: 32, colour: "ink", opacity: 0.18 },
      { x: 488, y: 398 + row * 140, width: 264, height: 20, colour: "ink", opacity: 0.08 },
    );
  }
  for (let row = 0; row < 5; row++)
    result.shapes.push({
      x: 1132,
      y: 244 + row * 112,
      width: row === 0 ? 332 : 260,
      height: 28,
      colour: row === 0 ? "accent" : "ink",
      opacity: row === 0 ? 1 : 0.16,
    });
  return result;
}
