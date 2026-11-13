import { expect, it } from "vitest";
import { workOrder, productLabels } from "@/content/projects/work-order";
import { projects, productProjects } from "./repository";
import { buildWorkEntries, neighbors } from "./work";

const build = (order: readonly string[] = workOrder, labels = productLabels) =>
  buildWorkEntries(projects, productProjects, order, labels);
it("includes every project once with ToolSwift first, original URLs and adjacent labels", () => {
  const entries = build();
  expect(entries).toHaveLength(28);
  expect(new Set(entries.map((entry) => entry.slug))).toEqual(
    new Set([...projects, ...productProjects].map((project) => project.slug)),
  );
  expect(entries.slice(0, 3).map((entry) => entry.productLabel)).toEqual([
    "ToolSwift",
    "ToolSwift",
    "ToolSwift",
  ]);
  expect(entries[0].href).toBe("/saas-dashboards/toolswift-customer-dashboard");
  expect(entries[0].disclosure).toBe("Real interface, sample data");
  expect(
    entries.find((entry) => entry.slug === "falcon-translation-dashboard")?.productLabel,
  ).toBeUndefined();
  for (const label of new Set(Object.values(productLabels))) {
    const indices = entries.flatMap((entry, index) =>
      entry.productLabel === label ? [index] : [],
    );
    expect(indices.at(-1)! - indices[0] + 1).toBe(indices.length);
  }
});
it("carries the start year and progress, and names no place of work", () => {
  const entries = build();
  expect(entries[0]).toMatchObject({ period: "2025", progress: "in-progress" });
  expect(entries.find((entry) => entry.slug === "smooth-erp")).toMatchObject({
    period: "2024",
    progress: "completed",
  });
  expect(entries.find((entry) => entry.slug === "falcons-gt-motors")).toMatchObject({
    period: "2025",
    progress: "completed",
  });
  expect(entries.find((entry) => entry.slug === "falconsgt-sml")).toMatchObject({
    period: "2025",
    progress: "completed",
  });
  expect(entries.find((entry) => entry.slug === "falconsgt-luxury")).toMatchObject({
    period: "2025",
    progress: "completed",
  });
  expect(JSON.stringify(entries)).not.toMatch(/webelocity|fivem|freelanc/i);
});
it("rejects missing, duplicate, unknown slugs, unknown labels and separated groups", () => {
  expect(() => build(workOrder.slice(0, -1))).toThrow(/Missing/);
  expect(() => build([...workOrder, workOrder[0]])).toThrow(/Duplicate/);
  expect(() => build([...workOrder, "unknown"])).toThrow(/Unknown/);
  expect(() => build(workOrder, { unknown: "Other" })).toThrow(/Unknown/);
  const separated: string[] = [...workOrder];
  [separated[5], separated[8]] = [separated[8], separated[5]];
  expect(() => build(separated)).toThrow(/adjacent/);
  expect(() =>
    buildWorkEntries(projects, [...productProjects, productProjects[0]], workOrder, productLabels),
  ).toThrow(/Duplicate/);
  expect(() => build([workOrder[3], ...workOrder.slice(0, 3), ...workOrder.slice(4)])).toThrow(
    /ToolSwift/,
  );
});

it("finds neighbors without looping and rejects unknown slugs", () => {
  expect(neighbors(workOrder[0]).previous).toBeUndefined();
  expect(neighbors(workOrder[0]).next?.slug).toBe(workOrder[1]);
  expect(neighbors(workOrder.at(-1)!).next).toBeUndefined();
  expect(neighbors(workOrder.at(-1)!).previous?.slug).toBe(workOrder.at(-2));
  expect(neighbors(workOrder[1]).previous?.slug).toBe(workOrder[0]);
  expect(neighbors(workOrder[1]).next?.slug).toBe(workOrder[2]);
  expect(() => neighbors("unknown")).toThrow(/Unknown/);
});
