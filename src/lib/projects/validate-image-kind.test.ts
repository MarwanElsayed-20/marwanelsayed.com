import { describe, expect, it } from "vitest";
import type { Project, ProjectImage } from "./types";
import { validateProjects } from "./validate";
const image = {
  src: "/projects/test/card.png",
  width: 1600,
  height: 1000,
  alt: "Illustration of a catalog",
  kind: "illustration",
  caption: "Illustration; not a screenshot.",
};
const validate = (over: Record<string, unknown> = {}) =>
  validateProjects(
    [
      {
        slug: "test",
        title: "Test",
        category: "e-commerce",
        summary: "Summary",
        image: { ...image, ...over } as ProjectImage,
      } satisfies Project,
    ],
    "production",
    ["e-commerce"],
  );
describe("image kind", () => {
  it("accepts both disclosed kinds and existing images", () => {
    expect(validate()).toEqual([]);
    expect(
      validate({
        kind: "reconstruction",
        alt: "Reconstruction of a table",
        caption: "Reconstruction with sample data; not a screenshot.",
      }),
    ).toEqual([]);
    expect(validate({ kind: undefined, caption: undefined, alt: "Catalog" })).toEqual([]);
    expect(
      validate({
        kind: "capture",
        alt: "Capture of a table",
        caption: "Real interface rendered from the project's code with sample data.",
      }),
    ).toEqual([]);
  });
  it.each([
    [{ caption: undefined }, "image.caption"],
    [{ caption: " " }, "image.caption"],
    [{ decorative: true }, "image.decorative"],
    [{ alt: "Catalog" }, "image.alt"],
    [{ kind: "unknown" }, "image.kind"],
    [{ caption: "Illustration" }, "image.caption"],
    [
      { kind: "reconstruction", alt: "Reconstruction", caption: "Not a screenshot." },
      "image.caption",
    ],
    [{ kind: "reconstruction", alt: "Reconstruction", caption: "Sample data." }, "image.caption"],
    [{ kind: "capture", alt: "Capture of a table", caption: " " }, "image.caption"],
    [{ kind: "capture", alt: "A table", caption: "Real interface, sample data." }, "image.alt"],
    [{ kind: "capture", decorative: true, caption: "Sample data." }, "image.decorative"],
  ])("rejects invalid disclosure %j", (over, field) => {
    expect(validate(over).join("\n")).toContain('projects[0] "test": ' + field);
  });
});
