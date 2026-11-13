import { describe, expect, it } from "vitest";
import { families } from "@/content/projects/families";
import { compactWork, productLabels, workOrder } from "@/content/projects/work-order";
import { defaultRole, rowRoles } from "@/content/site/work-page";
import { productProjects, projects } from "./repository";
import { buildWorkEntries } from "./work";
import { buildWorkRows } from "./work-rows";

const entries = buildWorkEntries(projects, productProjects, workOrder, productLabels);
const options = {
  roles: rowRoles,
  defaultRole,
  sectionOrder: ["digital-products", "digital-experiences"],
} as const;
const rows = () => buildWorkRows(entries, families, options);

describe("buildWorkRows", () => {
  it("makes each product family one row and every other project its own", () => {
    const built = rows();
    const inFamilies = families.flatMap((family) => family.members.length - 1);
    expect(built).toHaveLength(entries.length - inFamilies.reduce((sum, n) => sum + n, 0));
    expect(built.map((row) => row.title)).toEqual(
      expect.arrayContaining(["ToolSwift", "Smooth ERP", "Hemex", "FalconsGT"]),
    );
    const toolswift = built.find((row) => row.title === "ToolSwift")!;
    expect(toolswift.slug).toBe("toolswift-customer-dashboard");
    expect(toolswift.parts.map((part) => part.label)).toEqual([
      "Customer dashboard",
      "Admin platform",
      "Marketing site",
    ]);
    expect(toolswift.parts.map((part) => part.href)).toEqual(
      ["customer-dashboard", "admin-platform", "marketing"].map(
        (name) => entries.find((entry) => entry.slug === `toolswift-${name}`)!.href,
      ),
    );
    expect(toolswift.summary).toBe(
      "ToolSwift is a headless commerce platform with a merchant admin interface and a B2B customer portal.",
    );
  });

  it("keeps ToolSwift first and groups the rows by area, in the approved order within each", () => {
    const built = rows();
    expect(built[0].title).toBe("ToolSwift");
    const sections = built.map((row) => row.section);
    expect(sections.join()).toBe([...sections].sort((a, b) => b.localeCompare(a)).join());
    for (const section of ["digital-products", "digital-experiences"]) {
      const slugs = built.filter((row) => row.section === section).map((row) => row.slug);
      const positions = slugs.map((slug) => workOrder.indexOf(slug as (typeof workOrder)[number]));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });

  it("shows the kinds of work from our categories, not tools", () => {
    const built = rows();
    expect(built.find((row) => row.title === "ToolSwift")!.categories).toEqual([
      "Dashboards",
      "SaaS products",
      "Landing pages",
    ]);
    expect(built.find((row) => row.slug === "aligna")!.categories).toEqual(["Dashboards"]);
  });

  it("gives the start year only, and in progress or completed from the records", () => {
    const built = rows();
    const byTitle = (title: string) => built.find((row) => row.title === title)!;
    expect(byTitle("ToolSwift")).toMatchObject({ year: "2025", progress: "in-progress" });
    expect(byTitle("Smooth ERP")).toMatchObject({ year: "2024", progress: "completed" });
    expect(byTitle("Hemex")).toMatchObject({ year: "2024", progress: "completed" });
    // Motors, SML and Luxury (Phases 86-88) are all dated 2025 from their git history.
    expect(byTitle("FalconsGT")).toMatchObject({ year: "2025", progress: "completed" });
  });

  it("marks every project completed except the ToolSwift parts", () => {
    const records = [...projects, ...productProjects];
    const open = records.filter((record) => record.progress === "in-progress");
    expect(open.map((record) => record.slug).sort()).toEqual([
      "toolswift-admin-platform",
      "toolswift-customer-dashboard",
      "toolswift-marketing",
    ]);
    for (const record of records.filter((item) => !item.slug.startsWith("falconsgt")))
      if (!open.includes(record)) expect(record.progress, record.slug).toBe("completed");
  });

  it("names the role held: full-stack on Wajihni, the lead on Smooth ERP, front-end otherwise", () => {
    const built = rows();
    expect(built.find((row) => row.slug === "wajihni")!.role).toBe("Full-stack developer");
    expect(built.find((row) => row.title === "Smooth ERP")!.role).toBe("Front-end lead");
    expect(built.find((row) => row.title === "ToolSwift")!.role).toBe("Front-end developer");
  });

  it("lays a second screen on a single project and another part's card on an ecosystem", () => {
    const built = rows();
    const aligna = built.find((row) => row.slug === "aligna")!;
    expect(aligna.proofs.map((proof) => proof.src)).toEqual([
      "/work-proofs/aligna.webp",
      "/work-proofs/aligna-screen.webp",
    ]);
    const toolswift = built.find((row) => row.title === "ToolSwift")!;
    expect(toolswift.proofs[1].src).toBe("/work-proofs/toolswift-admin-platform.webp");
  });

  it("names no employer or place of work anywhere in what it builds", () => {
    expect(JSON.stringify(rows())).not.toMatch(/webelocity|fivem|freelanc/i);
  });

  it("fails when a family names a project that does not exist", () => {
    expect(() =>
      buildWorkRows(
        entries,
        [{ id: "x", name: "X", members: [{ slug: "nope", part: "P" }] }],
        options,
      ),
    ).toThrow(/unknown nope/);
  });

  it("marks the compact stores, which close the Websites & E-commerce area", () => {
    const built = buildWorkRows(entries, families, { ...options, compact: compactWork });
    const compact = built.filter((row) => row.compact).map((row) => row.slug);
    expect(compact).toEqual([...compactWork]);
    expect(built.slice(-compact.length).map((row) => row.slug)).toEqual(compact);
    expect(built.find((row) => row.slug === "expat-shop")?.compact).toBe(false);
    expect(rows().some((row) => row.compact)).toBe(false);
  });
  it("refuses a compact row placed before a full row of its area", () => {
    expect(() =>
      buildWorkRows(entries, families, { ...options, compact: ["home-central-stores"] }),
    ).toThrow(/must come after the full rows/);
  });
});
