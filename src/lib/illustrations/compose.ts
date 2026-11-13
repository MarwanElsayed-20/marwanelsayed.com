import type { IllustrationFacts } from "./types";
import { ordersTable } from "./layouts/orders-table";
import { erpPos } from "./layouts/erp-pos";
import { servicesHome } from "./layouts/services-home";
import { catalogGrid } from "./layouts/catalog-grid";
import { analyticsTiles } from "./layouts/analytics-tiles";
export type Shape = {
  x: number;
  y: number;
  width: number;
  height: number;
  colour: "accent" | "ink" | "surface";
  opacity?: number;
};
export type Lettering = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSizePx: number;
  colour?: "accent" | "ink" | "surface";
};
export type Composition = { shapes: Shape[]; lettering: Lettering[] };
const layouts = {
  "orders-table": ordersTable,
  "erp-pos": erpPos,
  "services-home": servicesHome,
  "catalog-grid": catalogGrid,
  "analytics-tiles": analyticsTiles,
};
function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
/** Pure composition. Layouts supply geometry; facts supply every string and colour. */
export function composeIllustration(facts: IllustrationFacts): {
  html: string;
  texts: { text: string; fontSizePx: number }[];
} {
  const composition = layouts[facts.layout](facts);
  const colour = (role: "accent" | "ink" | "surface") => {
    const value = facts.palette.find((c) => c.role === role)?.hex;
    if (!value || !/^#[a-f0-9]{6}$/i.test(value))
      throw new Error(facts.slug + ": invalid " + role + " colour");
    return value;
  };
  const family = facts.type.status === "reproduced" ? facts.type.family : "Inter";
  const shapes = composition.shapes
    .map(
      (s) =>
        '<div style="position:absolute;left:' +
        s.x +
        "px;top:" +
        s.y +
        "px;width:" +
        s.width +
        "px;height:" +
        s.height +
        "px;border-radius:16px;background:" +
        colour(s.colour) +
        ";opacity:" +
        (s.opacity ?? 1) +
        '"></div>',
    )
    .join("");
  const texts = composition.lettering
    .map((t) => {
      if (t.fontSizePx < 44 || !facts.texts.some((f) => f.text === t.text))
        throw new Error(facts.slug + ": invalid drawn text");
      return (
        '<div data-text style="position:absolute;left:' +
        t.x +
        "px;top:" +
        t.y +
        "px;width:" +
        t.width +
        "px;font-size:" +
        t.fontSizePx +
        "px;line-height:1.2;font-weight:600;overflow-wrap:break-word;color:" +
        colour(t.colour ?? "ink") +
        '">' +
        escape(t.text) +
        "</div>"
      );
    })
    .join("");
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0}*{box-sizing:border-box}</style></head><body><main style="position:relative;width:1600px;height:1000px;overflow:hidden;background:' +
    colour("surface") +
    ";font-family:&quot;" +
    escape(family) +
    "&quot;;color:" +
    colour("ink") +
    '">' +
    shapes +
    texts +
    "</main></body></html>";
  return {
    html,
    texts: composition.lettering.map(({ text, fontSizePx }) => ({ text, fontSizePx })),
  };
}
