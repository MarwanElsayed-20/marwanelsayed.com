import { describe, expect, it } from "vitest";
import type { CategoryId, Project } from "@/lib/projects/types";
import { assertValidProjects, validateProjects } from "./validate";

const ids: readonly CategoryId[] = ["e-commerce", "landing-pages", "interactive-websites"];

function base(over: Partial<Project> = {}): Project {
  return {
    slug: "a-project",
    title: "A project",
    category: "e-commerce",
    summary: "A summary.",
    ...over,
  };
}

const prod = (list: readonly Project[]) => validateProjects(list, "production", ids);
const sample = (list: readonly Project[]) => validateProjects(list, "sample", ids);
const bad = (over: Record<string, unknown>): Project =>
  ({ ...base(), ...over }) as unknown as Project;

describe("validateProjects: required fields", () => {
  it("accepts an empty list and a minimal record", () => {
    expect(prod([])).toEqual([]);
    expect(prod([base()])).toEqual([]);
  });

  it("accepts empty optional lists", () => {
    expect(prod([base({ context: [], builtWith: [] })])).toEqual([]);
  });

  it("names the record and field for a missing title", () => {
    expect(prod([bad({ title: undefined })])).toContain(
      'projects[0] "a-project": title: is required',
    );
  });

  it("rejects a title over 80 characters but accepts exactly 80", () => {
    expect(prod([base({ title: "x".repeat(80) })])).toEqual([]);
    expect(prod([base({ title: "x".repeat(81) })])).toContain(
      'projects[0] "a-project": title: must be 1 to 80 characters',
    );
  });

  it("rejects a summary over 200 characters but accepts exactly 200", () => {
    expect(prod([base({ summary: "x".repeat(200) })])).toEqual([]);
    expect(prod([base({ summary: "x".repeat(201) })])).toContain(
      'projects[0] "a-project": summary: must be 1 to 200 characters',
    );
    expect(prod([bad({ summary: undefined })])).toContain(
      'projects[0] "a-project": summary: is required',
    );
  });

  it("rejects bad slugs", () => {
    const message =
      "slug: must be lowercase letters, numbers, and single hyphens (1 to 60 characters)";
    for (const slug of ["Bad_Slug", "double--hyphen", "-leading", "trailing-", "a".repeat(61)]) {
      expect(prod([base({ slug })]).join("\n")).toContain(message);
    }
    expect(prod([base({ slug: "a".repeat(60) })])).toEqual([]);
    expect(prod([bad({ slug: undefined })])).toContain(
      'projects[0] "(no slug)": slug: is required',
    );
  });

  it("rejects duplicate slugs and duplicate titles (case-insensitive)", () => {
    const errors = prod([
      base(),
      base({ slug: "a-project", title: "Another title" }),
      base({ slug: "third", title: "a PROJECT" }),
    ]);
    expect(errors).toContain('projects[1] "a-project": slug: duplicates projects[0]');
    expect(errors).toContain('projects[2] "third": title: duplicates projects[0]');
  });

  it("rejects an unknown or missing category", () => {
    expect(prod([bad({ category: "products" })])).toContain(
      'projects[0] "a-project": category: "products" is not one of e-commerce, landing-pages, interactive-websites',
    );
    expect(prod([bad({ category: undefined })])).toContain(
      'projects[0] "a-project": category: is required',
    );
  });
});

describe("validateProjects: optional fields", () => {
  it("validates paragraph lists", () => {
    expect(
      prod([base({ context: Array.from({ length: 7 }, () => "Text.") })]).join("\n"),
    ).toContain("context: must have at most 6 paragraphs");
    expect(prod([base({ role: ["ok", "   "] })])).toContain(
      'projects[0] "a-project": role[1]: must be 1 to 1200 characters',
    );
    expect(prod([base({ outcomes: ["x".repeat(1201)] })]).join("\n")).toContain(
      "outcomes[0]: must be 1 to 1200 characters",
    );
    expect(prod([bad({ approach: "not a list" })])).toContain(
      'projects[0] "a-project": approach: must be a list of paragraphs',
    );
  });

  it("validates builtWith", () => {
    expect(prod([base({ builtWith: ["One", "Two"] })])).toEqual([]);
    expect(prod([base({ builtWith: ["One", "one"] })])).toContain(
      'projects[0] "a-project": builtWith[1]: duplicates builtWith[0]',
    );
    expect(prod([base({ builtWith: ["x".repeat(41)] })]).join("\n")).toContain(
      "builtWith[0]: must be 1 to 40 characters",
    );
    expect(
      prod([base({ builtWith: Array.from({ length: 13 }, (_, i) => `Tool ${i}`) })]).join("\n"),
    ).toContain("builtWith: must have at most 12 entries");
  });

  it("validates period and status", () => {
    expect(prod([base({ period: "x".repeat(41) })]).join("\n")).toContain(
      "period: must be 1 to 40 characters",
    );
    expect(prod([bad({ status: "gone" })])).toContain(
      'projects[0] "a-project": status: must be live, offline, or archived',
    );
    expect(prod([base({ status: "archived" })])).toEqual([]);
  });
});

describe("validateProjects: images", () => {
  const image = { src: "/projects/a-project/cover.webp", width: 1200, height: 800 };

  it("accepts an image with alt text or marked decorative", () => {
    expect(prod([base({ image: { ...image, alt: "Description" } })])).toEqual([]);
    expect(prod([base({ image: { ...image, decorative: true } })])).toEqual([]);
    expect(prod([base({ image: { ...image, alt: "Description", caption: "Caption" } })])).toEqual(
      [],
    );
  });

  it("requires exactly one of alt and decorative", () => {
    expect(prod([base({ image })])).toContain(
      'projects[0] "a-project": image: provide exactly one of alt or decorative',
    );
    expect(prod([base({ image: { ...image, alt: "x", decorative: true } })])).toContain(
      'projects[0] "a-project": image: provide exactly one of alt or decorative',
    );
    expect(prod([base({ image: { ...image, alt: " " } })]).join("\n")).toContain(
      "image.alt: must be 1 to 200 characters",
    );
  });

  it("rejects bad sources and sizes in production", () => {
    const message =
      "image.src: must start with /projects/ and end in .avif, .webp, .png, .jpg, or .jpeg";
    for (const src of [
      "https://elsewhere.test/a.png",
      "/projects/a/b.gif",
      "/projects/a/../b.png",
      "/design-system/sample-image/one.svg",
      "projects/a.png",
    ]) {
      expect(prod([base({ image: { ...image, src, alt: "x" } })]).join("\n")).toContain(message);
    }
    expect(prod([base({ image: { ...image, width: 0, alt: "x" } })])).toContain(
      'projects[0] "a-project": image.width: must be a positive integer',
    );
    expect(prod([base({ image: { ...image, height: 1.5, alt: "x" } })])).toContain(
      'projects[0] "a-project": image.height: must be a positive integer',
    );
  });
});

describe("validateProjects: live links", () => {
  const withLink = (url: string, extra: Partial<Project> = {}) =>
    base({ liveLink: { url }, ...extra });

  it("accepts a plain https link and a labelled one", () => {
    expect(prod([withLink("https://example.com/")])).toEqual([]);
    expect(prod([base({ liveLink: { url: "https://example.com/", label: "Open it" } })])).toEqual(
      [],
    );
  });

  it("rejects insecure, malformed, credentialed, and dotless links", () => {
    const message =
      'projects[0] "a-project": liveLink.url: must be a valid https URL without credentials';
    for (const url of [
      "http://example.com/",
      "not a url",
      "https://user:secret@example.com/",
      "https://localhost/",
      "javascript:alert(1)",
      "",
    ]) {
      expect(prod([withLink(url)])).toContain(message);
    }
  });

  it("rejects a link on an offline or archived project and an over-long label", () => {
    expect(prod([withLink("https://example.com/", { status: "offline" })])).toContain(
      'projects[0] "a-project": liveLink: not allowed when status is offline or archived',
    );
    expect(prod([withLink("https://example.com/", { status: "archived" })]).join("\n")).toContain(
      "liveLink: not allowed when status is offline or archived",
    );
    expect(
      prod([base({ liveLink: { url: "https://example.com/", label: "x".repeat(61) } })]).join("\n"),
    ).toContain("liveLink.label: must be 1 to 60 characters");
  });
});

describe("validateProjects: sample isolation", () => {
  it("forbids the sample flag in production data", () => {
    expect(prod([base({ sample: true })])).toContain(
      'projects[0] "a-project": sample: not allowed in production data',
    );
  });

  it("requires the sample flag, no links, and sample image sources in sample data", () => {
    expect(sample([base()])).toContain(
      'projects[0] "a-project": sample: must be true in sample data',
    );
    expect(sample([base({ sample: true, liveLink: { url: "https://example.com/" } })])).toContain(
      'projects[0] "a-project": liveLink: not allowed in sample data',
    );
    expect(
      sample([
        base({
          sample: true,
          image: { src: "/design-system/sample-image/one.svg", width: 800, height: 500, alt: "x" },
        }),
      ]),
    ).toEqual([]);
    expect(
      sample([
        base({
          sample: true,
          image: { src: "/projects/a.png", width: 800, height: 500, alt: "x" },
        }),
      ]).join("\n"),
    ).toContain("image.src: must start with /design-system/sample-image/");
  });
});

describe("assertValidProjects", () => {
  it("returns the list when valid", () => {
    const list = [base()];
    expect(assertValidProjects(list, "production", ids)).toBe(list);
  });

  it("throws one error naming every problem", () => {
    expect(() =>
      assertValidProjects([bad({ title: undefined }), bad({ slug: "Bad" })], "production", ids),
    ).toThrow(/projects\[0\] "a-project": title: is required[\s\S]*projects\[1\] "Bad": slug:/);
  });
});

describe("validateProjects: screens on Websites & E-commerce", () => {
  const screen = {
    src: "/projects/a-project/screens/01-home.png",
    width: 2880,
    height: 1920,
    kind: "capture",
    alt: "Capture of the home page shown with sample data.",
    caption: "Home page. Real interface, sample data.",
  };

  it("accepts up to 10 capture screens and rejects 11", () => {
    expect(prod([bad({ screens: Array(10).fill(screen) })])).toEqual([]);
    expect(prod([bad({ screens: Array(11).fill(screen) })])).toContain(
      'projects[0] "a-project": screens: must have at most 10 entries',
    );
  });

  it("checks each screen like any other image", () => {
    expect(prod([bad({ screens: [{ ...screen, caption: " " }] })])).toContain(
      'projects[0] "a-project": screens[0].caption: is required for kind',
    );
  });
});

describe("case-study field validation", () => {
  const valid = {
    scope: "x".repeat(20),
    features: [{ title: "Flow", points: ["A step"] }],
    decisions: [{ title: "Choice", detail: "A concrete choice" }],
  };
  it("accepts all fields and exact upper limits", () => {
    expect(prod([base(valid)])).toEqual([]);
    expect(
      prod([
        base({
          scope: "x".repeat(220),
          features: Array.from({ length: 6 }, () => ({
            title: "x".repeat(60),
            points: Array(5).fill("x".repeat(200)),
          })),
          decisions: Array.from({ length: 8 }, () => ({
            title: "x".repeat(80),
            detail: "x".repeat(400),
          })),
        }),
      ]),
    ).toEqual([]);
  });
  it.each([
    { scope: "" },
    { scope: " ".repeat(30) },
    { scope: "x".repeat(19) },
    { scope: "x".repeat(221) },
    { features: [] },
    { features: "bad" },
    { features: [null] },
    { features: Array(7).fill(valid.features[0]) },
    { features: [{ title: "", points: ["Step"] }] },
    { features: [{ title: "x".repeat(61), points: ["Step"] }] },
    { features: [{ title: "Flow", points: [] }] },
    { features: [{ title: "Flow", points: Array(6).fill("Step") }] },
    { features: [{ title: "Flow", points: [" "] }] },
    { features: [{ title: "Flow", points: ["x".repeat(201)] }] },
    { decisions: [] },
    { decisions: [null] },
    { decisions: Array(9).fill(valid.decisions[0]) },
    { decisions: [{ title: " ", detail: "Choice" }] },
    { decisions: [{ title: "x".repeat(81), detail: "Choice" }] },
    { decisions: [{ title: "Choice", detail: " " }] },
    { decisions: [{ title: "Choice", detail: "x".repeat(401) }] },
    { limitations: ["A boundary"] },
  ])("rejects invalid new fields: %j", (fields) => {
    expect(prod([base(fields as never)])).not.toEqual([]);
  });
  it("validates view and requires captions for non-desktop screens", () => {
    const screen = { src: "/projects/test.webp", width: 10, height: 20, alt: "Screen" };
    for (const view of ["desktop", "tablet", "phone", "state"] as const) {
      expect(
        prod([base({ screens: [{ ...screen, view, caption: "Screen description" }] })]),
      ).toEqual([]);
    }
    for (const view of ["tablet", "phone", "state", "invalid"]) {
      expect(prod([base({ screens: [{ ...screen, view }] } as never)])).not.toEqual([]);
    }
    expect(prod([base({ screens: [screen] })])).toEqual([]);
  });
});
