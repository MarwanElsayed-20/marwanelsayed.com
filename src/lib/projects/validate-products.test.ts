import { describe, expect, it } from "vitest";
import type { BaseProject, CategoryId, ProductProject } from "@/lib/projects/types";
import { assertValidProjects, validateProjects } from "./validate";

const productIds: readonly CategoryId[] = ["saas-products", "dashboards"];
const experienceIds: readonly CategoryId[] = [
  "e-commerce",
  "landing-pages",
  "interactive-websites",
];

function product(over: Record<string, unknown> = {}): ProductProject {
  return {
    slug: "a-product",
    title: "A product",
    category: "saas-products",
    summary: "A summary.",
    ...over,
  } as unknown as ProductProject;
}

function image(over: Record<string, unknown> = {}) {
  return {
    src: "/projects/a-product/one.webp",
    width: 1600,
    height: 1000,
    alt: "A description",
    ...over,
  };
}

const prod = (list: readonly BaseProject[]) =>
  validateProjects(list, "production", productIds, "digital-products");
const sampleMode = (list: readonly BaseProject[]) =>
  validateProjects(list, "sample", productIds, "digital-products");
const experience = (list: readonly BaseProject[]) =>
  validateProjects(list, "production", experienceIds);

describe("product records: accepted shapes", () => {
  it("accepts an empty list, a minimal record, and a full record", () => {
    expect(prod([])).toEqual([]);
    expect(prod([product()])).toEqual([]);
    expect(
      prod([
        product({
          productContext: ["One."],
          usersAndProblems: ["Two."],
          workflows: ["Three."],
          designDecisions: ["Four."],
          role: ["Five."],
          outcomes: ["Six."],
          image: image(),
          screens: [image(), image({ alt: undefined, decorative: true })],
          builtWith: ["Tool one"],
          period: "Period one",
        }),
      ]),
    ).toEqual([]);
  });

  it("accepts empty optional lists", () => {
    expect(prod([product({ productContext: [], screens: [], builtWith: [] })])).toEqual([]);
  });
});

describe("product records: fields from the other section", () => {
  it("rejects context and approach on a product, naming the record and field", () => {
    const errors = prod([product({ context: ["x"], approach: ["y"] })]);
    expect(errors).toContain('projects[0] "a-product": context: is not a field of this section');
    expect(errors).toContain('projects[0] "a-product": approach: is not a field of this section');
  });

  it("rejects product-only fields on a Websites & E-commerce record", () => {
    const base = {
      slug: "an-experience",
      title: "An experience",
      category: "e-commerce",
      summary: "S.",
    };
    const errors = experience([
      {
        ...base,
        productContext: ["x"],
        usersAndProblems: ["x"],
        workflows: ["x"],
        designDecisions: ["x"],
        screens: [image()],
      } as unknown as BaseProject,
    ]);
    for (const field of ["productContext", "usersAndProblems", "workflows", "designDecisions"]) {
      expect(errors).toContain(
        `projects[0] "an-experience": ${field}: is not a field of this section`,
      );
    }
    expect(errors).not.toContain(
      'projects[0] "an-experience": screens: is not a field of this section',
    );
  });

  it("rejects unknown fields and ignores fields set to undefined", () => {
    expect(prod([product({ colour: "red" })])).toContain(
      'projects[0] "a-product": colour: is not a field of this section',
    );
    expect(prod([product({ colour: undefined })])).toEqual([]);
  });

  it("rejects the other section's categories in both directions", () => {
    expect(prod([product({ category: "e-commerce" })])).toContain(
      'projects[0] "a-product": category: "e-commerce" is not one of saas-products, dashboards',
    );
    expect(
      experience([
        { slug: "x", title: "X", category: "dashboards", summary: "S." } as unknown as BaseProject,
      ]),
    ).toContain(
      'projects[0] "x": category: "dashboards" is not one of e-commerce, landing-pages, interactive-websites',
    );
  });
});

describe("product records: paragraph fields", () => {
  it("accepts exactly 6 paragraphs of exactly 1200 characters", () => {
    const six = Array.from({ length: 6 }, () => "x".repeat(1200));
    expect(prod([product({ workflows: six })])).toEqual([]);
  });

  it("rejects 7 paragraphs, an over-long paragraph, a blank paragraph, and a non-list", () => {
    const seven = Array.from({ length: 7 }, () => "x");
    expect(prod([product({ designDecisions: seven })])).toContain(
      'projects[0] "a-product": designDecisions: must have at most 6 paragraphs',
    );
    expect(prod([product({ usersAndProblems: ["ok", "x".repeat(1201)] })])).toContain(
      'projects[0] "a-product": usersAndProblems[1]: must be 1 to 1200 characters',
    );
    expect(prod([product({ outcomes: ["   "] })])).toContain(
      'projects[0] "a-product": outcomes[0]: must be 1 to 1200 characters',
    );
    expect(prod([product({ workflows: "not a list" })])).toContain(
      'projects[0] "a-product": workflows: must be a list of paragraphs',
    );
  });
});

describe("product records: images and screens", () => {
  it("accepts exactly 10 screens and rejects 11", () => {
    const ten = Array.from({ length: 10 }, () => image());
    expect(prod([product({ screens: ten })])).toEqual([]);
    expect(prod([product({ screens: [...ten, image()] })])).toContain(
      'projects[0] "a-product": screens: must have at most 10 entries',
    );
  });

  it("rejects screens that are not a list", () => {
    expect(prod([product({ screens: image() })])).toContain(
      'projects[0] "a-product": screens: must be a list of images',
    );
  });

  it("reports screen problems with the screen index and field", () => {
    const errors = prod([
      product({
        screens: [
          image({ width: 0 }),
          image({ alt: "Both", decorative: true }),
          image({ src: "/elsewhere/x.png" }),
          image({ alt: undefined }),
        ],
      }),
    ]);
    expect(errors).toContain(
      'projects[0] "a-product": screens[0].width: must be a positive integer',
    );
    expect(errors).toContain(
      'projects[0] "a-product": screens[1]: provide exactly one of alt or decorative',
    );
    expect(errors).toContain(
      'projects[0] "a-product": screens[2].src: must start with /projects/ and end in .avif, .webp, .png, .jpg, or .jpeg',
    );
    expect(errors).toContain(
      'projects[0] "a-product": screens[3]: provide exactly one of alt or decorative',
    );
  });

  it("keeps the primary image messages unchanged", () => {
    expect(prod([product({ image: image({ height: -1 }) })])).toContain(
      'projects[0] "a-product": image.height: must be a positive integer',
    );
  });
});

describe("product records: modes", () => {
  it("rejects the sample flag in production and requires it in sample data", () => {
    expect(prod([product({ sample: true })])).toContain(
      'projects[0] "a-product": sample: not allowed in production data',
    );
    expect(sampleMode([product()])).toContain(
      'projects[0] "a-product": sample: must be true in sample data',
    );
  });

  it("accepts sample screens only with the sample image path", () => {
    const sampleImage = image({ src: "/design-system/sample-image/dashboard.svg" });
    expect(
      sampleMode([product({ sample: true, image: sampleImage, screens: [sampleImage] })]),
    ).toEqual([]);
    expect(sampleMode([product({ sample: true, screens: [image()] })])).toContain(
      'projects[0] "a-product": screens[0].src: must start with /design-system/sample-image/',
    );
  });

  it("rejects a link in sample data and on an offline product", () => {
    const link = { url: "https://example.com/" };
    expect(sampleMode([product({ sample: true, liveLink: link })])).toContain(
      'projects[0] "a-product": liveLink: not allowed in sample data',
    );
    expect(prod([product({ status: "offline", liveLink: link })])).toContain(
      'projects[0] "a-product": liveLink: not allowed when status is offline or archived',
    );
  });
});

describe("assertValidProjects with product rules", () => {
  it("returns the same list when valid", () => {
    const list = [product()];
    expect(assertValidProjects(list, "production", productIds, "digital-products")).toBe(list);
  });

  it("throws one error listing every problem", () => {
    expect(() =>
      assertValidProjects(
        [product({ title: undefined, approach: ["x"] })],
        "production",
        productIds,
        "digital-products",
      ),
    ).toThrow(/title: is required[\s\S]*approach: is not a field of this section/);
  });
});

describe("case-study field validation", () => {
  const valid = {
    scope: "x".repeat(20),
    features: [{ title: "Flow", points: ["A step"] }],
    decisions: [{ title: "Choice", detail: "A concrete choice" }],
  };
  it("accepts all fields and exact upper limits", () => {
    expect(prod([product(valid)])).toEqual([]);
    expect(
      prod([
        product({
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
    expect(prod([product(fields as never)])).not.toEqual([]);
  });
  it("validates view and requires captions for non-desktop screens", () => {
    const screen = { src: "/projects/test.webp", width: 10, height: 20, alt: "Screen" };
    for (const view of ["desktop", "tablet", "phone", "state"] as const) {
      expect(
        prod([product({ screens: [{ ...screen, view, caption: "Screen description" }] })]),
      ).toEqual([]);
    }
    for (const view of ["tablet", "phone", "state", "invalid"]) {
      expect(prod([product({ screens: [{ ...screen, view }] } as never)])).not.toEqual([]);
    }
    expect(prod([product({ screens: [screen] })])).toEqual([]);
  });
});
