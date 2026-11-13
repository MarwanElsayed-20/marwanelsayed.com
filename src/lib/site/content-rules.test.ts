import { describe, expect, it } from "vitest";
import {
  assertValidSiteContent,
  isAboutSupplied,
  isContactSupplied,
  isValidEmail,
  profileUrlProblem,
  validateSiteContent,
  type SiteContentInput,
} from "./content-rules";

const empty: SiteContentInput = {
  siteName: null,
  home: { headline: "Sample headline", introduction: null },
  about: { introduction: [], approach: [], background: [] },
  contact: { email: null, profiles: [] },
};

const complete: SiteContentInput = {
  siteName: "Studio Name",
  home: { headline: "Sample headline", introduction: "One plain sentence." },
  about: {
    introduction: ["First paragraph.", "Second paragraph."],
    approach: ["Approach paragraph."],
    background: ["Background paragraph."],
  },
  contact: {
    email: "name@studio.co.uk",
    profiles: [
      { label: "Profile one", url: "https://one.co.uk/name" },
      { label: "Profile two", url: "https://two.co.uk/name" },
    ],
  },
};

describe("validateSiteContent", () => {
  it("accepts content that is entirely not supplied", () => {
    expect(validateSiteContent(empty)).toEqual([]);
  });

  it("accepts complete content", () => {
    expect(validateSiteContent(complete)).toEqual([]);
  });

  it("names the record and field of a bad site name", () => {
    const problems = validateSiteContent({ ...empty, siteName: "  Padded " });
    expect(problems).toEqual([
      {
        record: "src/content/site/identity.ts",
        field: "siteName",
        message: "must not start or end with spaces.",
      },
    ]);
  });

  it.each([
    ["", "must not be empty."],
    ["Line one\nLine two", "must be a single line."],
    ["Has <b>tags</b>", "must be plain text without HTML tags."],
  ])("rejects a bad home introduction %j", (value, message) => {
    const problems = validateSiteContent({
      ...empty,
      home: { headline: "Sample headline", introduction: value },
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ record: "src/content/site/home.ts", message });
  });

  it("checks every About paragraph and names its index", () => {
    const problems = validateSiteContent({
      ...empty,
      about: { introduction: ["Good.", ""], approach: [" bad"], background: [] },
    });
    expect(problems.map((p) => p.field)).toEqual(["introduction[1]", "approach[0]"]);
  });

  it("allows multi-line text inside an About paragraph", () => {
    const problems = validateSiteContent({
      ...empty,
      about: { introduction: ["Line one\nLine two"], approach: [], background: [] },
    });
    expect(problems).toEqual([]);
  });

  it("accepts a WhatsApp number of digits and rejects a malformed one", () => {
    const fields = (whatsapp: string) =>
      validateSiteContent({ ...empty, contact: { email: null, profiles: [], whatsapp } }).map(
        (problem) => problem.field,
      );
    expect(fields("201114766628")).toEqual([]);
    for (const bad of ["+201114766628", "0111 476 6628", "123"])
      expect(fields(bad), bad).toEqual(["whatsapp"]);
  });

  it("rejects a malformed email", () => {
    for (const email of [
      "no-at-sign",
      "a@b",
      "a b@c.com",
      "mailto:a@b.com",
      "<a@b.com>",
      "a@@b.com",
    ]) {
      const problems = validateSiteContent({ ...empty, contact: { email, profiles: [] } });
      expect(
        problems.map((p) => p.field),
        email,
      ).toEqual(["email"]);
    }
  });

  it("rejects unusable profile links and duplicates", () => {
    const problems = validateSiteContent({
      ...empty,
      contact: {
        email: null,
        profiles: [
          { label: "One", url: "http://one.co.uk" },
          { label: "one", url: "https://one.co.uk/a" },
          { label: "Three", url: "https://one.co.uk/a" },
          { label: " ", url: "not a url" },
        ],
      },
    });
    expect(problems.map((p) => `${p.field}: ${p.message}`)).toEqual([
      "profiles[0].url: must start with https://.",
      "profiles[1].label: must be unique in the list.",
      "profiles[2].url: must be unique in the list.",
      "profiles[3].label: must not be empty.",
      "profiles[3].url: must be an absolute https:// address.",
    ]);
  });
});

describe("assertValidSiteContent", () => {
  it("returns valid input unchanged", () => {
    expect(assertValidSiteContent(complete)).toBe(complete);
  });

  it("throws one error that names every bad record and field", () => {
    expect(() =>
      assertValidSiteContent({
        ...empty,
        siteName: "",
        contact: { email: "bad", profiles: [] },
      }),
    ).toThrowError(/identity\.ts: siteName: must not be empty\.[\s\S]*contact\.ts: email:/);
  });
});

describe("helpers", () => {
  it("isValidEmail", () => {
    expect(isValidEmail("name@studio.co.uk")).toBe(true);
    expect(isValidEmail("name+tag@studio.co.uk")).toBe(true);
    expect(isValidEmail("name@.co.uk")).toBe(false);
    expect(isValidEmail("name@studio..uk")).toBe(false);
  });

  it("profileUrlProblem", () => {
    expect(profileUrlProblem("https://one.co.uk/name")).toBeNull();
    expect(profileUrlProblem("https://user:pw@one.co.uk")).toBe("must not contain credentials.");
    expect(profileUrlProblem("https://localhost")).toBe("must have a public host name.");
  });

  it("supplied flags follow the required parts only", () => {
    expect(isAboutSupplied(empty.about)).toBe(false);
    expect(isAboutSupplied({ introduction: [], approach: ["x"], background: ["y"] })).toBe(false);
    expect(isAboutSupplied(complete.about)).toBe(true);
    expect(isContactSupplied(empty.contact)).toBe(false);
    expect(isContactSupplied({ email: null, profiles: complete.contact.profiles })).toBe(false);
    expect(isContactSupplied(complete.contact)).toBe(true);
  });
});
