import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { sampleContact } from "@/content/site/review-samples";
import { ContactView } from "./contact-view";

afterEach(cleanup);

describe("ContactView", () => {
  it("shows the address as readable text inside a working email link", () => {
    render(<ContactView email={sampleContact.email} profiles={[]} />);
    const link = screen.getByRole("link", { name: sampleContact.email });
    expect(link.getAttribute("href")).toBe(`mailto:${sampleContact.email}`);
    expect(link.textContent).toBe(sampleContact.email);
  });

  it("has one h2 and the Email section", () => {
    render(<ContactView email={sampleContact.email} profiles={[]} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Contact");
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Email",
    ]);
  });

  it("omits Elsewhere entirely when there are no profile links", () => {
    render(<ContactView email={sampleContact.email} profiles={[]} />);
    expect(screen.queryByText("Elsewhere")).toBeNull();
  });

  it("lists profile links as safe external links", () => {
    render(<ContactView email={sampleContact.email} profiles={sampleContact.profiles} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Email",
      "Elsewhere",
    ]);
    for (const profile of sampleContact.profiles) {
      const link = screen.getByRole("link", { name: new RegExp(profile.label) });
      expect(link.getAttribute("href")).toBe(profile.url);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.textContent).toContain("opens in a new tab");
    }
  });

  it("contains no form or input of any kind", () => {
    const { container } = render(
      <ContactView email={sampleContact.email} profiles={sampleContact.profiles} />,
    );
    expect(container.querySelector("form, input, textarea, select, button")).toBeNull();
  });
});
