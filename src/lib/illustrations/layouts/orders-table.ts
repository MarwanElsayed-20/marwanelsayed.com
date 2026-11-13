import type { IllustrationFacts } from "../types";
import type { Composition } from "../compose";
export function ordersTable(f: IllustrationFacts): Composition {
  const name = f.texts.find((t) => t.role === "name")!;
  const nav = f.texts.filter((t) => t.role !== "name");
  const result: Composition = {
    shapes: [
      { x: 48, y: 160, width: 300, height: 792, colour: "ink" },
      { x: 388, y: 184, width: 1164, height: 100, colour: "accent", opacity: 0.2 },
    ],
    lettering: [{ text: name.text, x: 64, y: 60, width: 1472, fontSizePx: 60 }],
  };
  nav.forEach((t, i) =>
    result.lettering.push({
      text: t.text,
      x: 76,
      y: 204 + i * 112,
      width: 252,
      fontSizePx: 44,
      colour: "surface",
    }),
  );
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 3; col++)
      result.shapes.push({
        x: 416 + col * 370,
        y: 342 + row * 116,
        width: col === 0 ? 260 : 212,
        height: 28,
        colour: row === 0 ? "accent" : "ink",
        opacity: row === 0 ? 1 : 0.13,
      });
  return result;
}
