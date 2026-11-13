// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { productProjects, projects } from "@/lib/projects/repository";
import { shareCapture } from "./share-card";
import { shareImage } from "./share-image";

afterEach(() => vi.unstubAllEnvs());

async function png(input: Parameters<typeof shareImage>[0]) {
  const response = shareImage(input);
  expect(response.headers.get("content-type")).toBe("image/png");
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), size: bytes.length };
}

it("renders page, project and fallback cards at 1200 by 630 with the bundled fonts", async () => {
  vi.stubEnv("SITE_URL", "");
  const aligna = productProjects.find((project) => project.slug === "aligna")!;
  const flagged = projects.find((project) => project.slug === "amherst-supply")!;
  const cards = [
    { ownerName: "Marwan Elsayed", title: "Front-end engineer", line: "A line under it." },
    { ownerName: "Marwan Elsayed", title: "A considered interface ".repeat(12), line: "" },
    {
      ownerName: "Marwan Elsayed",
      title: aligna.title,
      line: aligna.summary,
      sectionLabel: "SaaS & Dashboards",
      capture: shareCapture(aligna),
    },
    {
      ownerName: "Marwan Elsayed",
      title: flagged.title,
      line: flagged.summary,
      sectionLabel: "Websites & E-commerce",
      capture: shareCapture(flagged),
    },
    // A missing file falls back to text only instead of failing the build.
    { ownerName: "Marwan Elsayed", title: "Missing", capture: "/projects/none/card.png" },
  ];
  for (const card of cards) {
    const image = await png(card);
    expect([image.width, image.height]).toEqual([1200, 630]);
    expect(image.size).toBeLessThan(1_000_000);
  }
}, 60_000);
