import { expect, it } from "vitest";
import { CAPTION } from "./labels";
import { validateProjects } from "@/lib/projects/validate";
it.each(["illustration", "reconstruction", "capture"] as const)(
  "validates %s labels and captions",
  (kind) => {
    expect(CAPTION[kind].length).toBeLessThanOrEqual(160);
    expect(
      validateProjects(
        [
          {
            slug: "test",
            title: "Test",
            category: "e-commerce",
            summary: "Summary",
            image: {
              src: "/projects/test/card.png",
              width: 1600,
              height: 1000,
              kind,
              alt: kind + " of a layout",
              caption: CAPTION[kind],
            },
          },
        ],
        "production",
        ["e-commerce"],
      ),
    ).toEqual([]);
  },
);
