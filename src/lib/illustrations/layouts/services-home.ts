import type { IllustrationFacts } from "../types";
import type { Composition } from "../compose";
export function servicesHome(f: IllustrationFacts): Composition {
  const name = f.texts.find((t) => t.role === "name")!;
  const nav = f.texts.filter((t) => t.role !== "name");
  const result: Composition = {
    shapes: [
      { x: 56, y: 236, width: 1488, height: 356, colour: "accent", opacity: 0.13 },
      { x: 1016, y: 268, width: 480, height: 292, colour: "accent" },
      { x: 104, y: 302, width: 708, height: 52, colour: "ink", opacity: 0.22 },
      { x: 104, y: 396, width: 572, height: 26, colour: "ink", opacity: 0.12 },
      { x: 104, y: 450, width: 444, height: 26, colour: "ink", opacity: 0.12 },
    ],
    lettering: [{ text: name.text, x: 64, y: 44, width: 1472, fontSizePx: 60 }],
  };
  nav.forEach((t, i) =>
    result.lettering.push({ text: t.text, x: 64 + i * 504, y: 142, width: 460, fontSizePx: 44 }),
  );
  for (let i = 0; i < 3; i++)
    result.shapes.push(
      { x: 56 + i * 504, y: 656, width: 480, height: 288, colour: "accent", opacity: 0.08 },
      { x: 92 + i * 504, y: 704, width: 256, height: 56, colour: "accent", opacity: 0.3 },
      { x: 92 + i * 504, y: 808, width: 316, height: 24, colour: "ink", opacity: 0.12 },
    );
  return result;
}
