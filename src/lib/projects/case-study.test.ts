import { expect, it } from "vitest";
import { buildSections } from "./case-study";
import type { Project, ProductProject } from "./types";

const base: Project = { slug: "test", title: "Test", category: "e-commerce", summary: "Summary" };
const image = { src: "/projects/test.webp", width: 100, height: 80, alt: "Screen" };
it("omits missing, empty and blank content", () => {
  expect(buildSections(base, "digital-experiences")).toEqual([]);
  expect(
    buildSections(
      {
        ...base,
        context: [" "],
        features: [{ title: " ", points: [" "] }],
        decisions: [{ title: "", detail: "" }],
        builtWith: [],
      },
      "digital-experiences",
    ),
  ).toEqual([]);
});
it("orders sections, maps results, and groups screens without changing their order", () => {
  const sections = buildSections(
    {
      ...base,
      context: ["Context"],
      role: ["Role"],
      outcomes: ["Result"],
      screens: [
        image,
        { ...image, view: "phone", caption: "Phone" },
        { ...image, view: "state", caption: "Empty state" },
      ],
      features: [{ title: "Flow", points: ["Step"] }],
      approach: ["Approach"],
      decisions: [{ title: "Choice", detail: "Reason" }],
      builtWith: ["Next.js"],
    },
    "digital-experiences",
  );
  expect(sections.map((s) => s.id)).toEqual([
    "overview",
    "walkthrough",
    "features",
    "architecture",
    "technologies",
  ]);
  expect(sections[0].paragraphs).toEqual(["Context", "Role"]);
  expect(sections[0].items).toEqual(["Result"]);
  expect(sections[1].screens).toEqual([image]);
  expect(sections[1].responsive.map((s) => s.view)).toEqual(["phone", "state"]);
  expect(sections[3].paragraphs).toEqual(["Approach"]);
});
it("maps product context, users, workflows and architecture", () => {
  const product: ProductProject = {
    ...base,
    productContext: ["Context"],
    usersAndProblems: ["Users"],
    role: ["Role"],
    workflows: ["Workflow"],
    designDecisions: ["Design"],
    outcomes: ["Result"],
  };
  const sections = buildSections(product, "digital-products");
  expect(sections.map((s) => s.id)).toEqual(["overview", "features", "architecture"]);
  expect(sections[0].paragraphs).toEqual(["Context", "Users", "Role"]);
  expect(sections[0].items).toEqual(["Result"]);
  expect(sections[1].paragraphs).toEqual(["Workflow"]);
  expect(sections[2].paragraphs).toEqual(["Design"]);
});
