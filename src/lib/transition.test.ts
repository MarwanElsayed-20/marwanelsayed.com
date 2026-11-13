import { describe, expect, it } from "vitest";
import { transitionTarget } from "./transition";

const current = {
  origin: "https://site.test",
  pathname: "/",
  search: "",
  href: "https://site.test/",
};
const plain = {
  defaultPrevented: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};
const link = (href: string, attrs: Record<string, string> = {}) => {
  const anchor = document.createElement("a");
  anchor.setAttribute("href", href);
  for (const [key, value] of Object.entries(attrs)) anchor.setAttribute(key, value);
  return anchor;
};
const internal = (path: string) => link(`https://site.test${path}`);

describe("transitionTarget", () => {
  it("accepts an internal link to another page", () => {
    expect(transitionTarget(plain, internal("/work"), current)?.pathname).toBe("/work");
  });

  it("keeps the hash for a link to a section of another page", () => {
    const url = transitionTarget(plain, internal("/work#top"), { ...current, pathname: "/about" });
    expect(url?.hash).toBe("#top");
  });

  it("ignores same-page links and hash-only links", () => {
    expect(transitionTarget(plain, internal("/#work"), current)).toBeNull();
    expect(transitionTarget(plain, internal("/"), current)).toBeNull();
    expect(transitionTarget(plain, internal("/?hero=fallback"), current)).toBeNull();
  });

  it("ignores modified or non-primary clicks and prevented events", () => {
    for (const patch of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
      { defaultPrevented: true },
    ])
      expect(transitionTarget({ ...plain, ...patch }, internal("/work"), current)).toBeNull();
  });

  it("ignores new-tab, download, opted-out, external and non-http links", () => {
    const attempts = [
      link("https://site.test/work", { target: "_blank" }),
      link("https://site.test/f.pdf", { download: "" }),
      link("https://site.test/work", { "data-no-transition": "" }),
      link("https://other.test/work"),
      link("mailto:a@b.co"),
      null,
    ];
    for (const attempt of attempts) expect(transitionTarget(plain, attempt, current)).toBeNull();
  });
});
