import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { aboutContent, aboutPage } from "@/content/site/about";
import { AboutPage } from "./about-page";

afterEach(cleanup);
const props = {
  content: aboutContent,
  name: "Marwan Elsayed",
  role: "Front-end engineer",
  place: "Cairo, Egypt",
  email: "me@example.com",
  profiles: [
    { label: "GitHub", url: "https://github.com/example" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/example" },
  ],
  currentWork: [
    { label: "Customer dashboard", href: "/saas-dashboards/toolswift-customer-dashboard" },
    { label: "Admin platform", href: "/saas-dashboards/toolswift-admin-platform" },
  ],
  counts: { experiences: 18, products: 8 },
  technologies: [{ name: "React", count: 20 }],
};
const headings = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

it("opens with the name as the one h1, the role, the lead and the way onward", () => {
  render(<AboutPage {...props} />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Marwan Elsayed");
  expect(screen.getByText("About / Cairo, Egypt")).toBeTruthy();
  expect(screen.getByText(aboutContent.introduction[0])).toBeTruthy();
  expect(screen.getAllByText("Front-end engineer").length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: aboutPage.actions.work }).getAttribute("href")).toBe(
    "/work",
  );
  expect(screen.getByRole("link", { name: aboutPage.actions.touch }).getAttribute("href")).toBe(
    "/#contact",
  );
});

it("offers the CV download beside See the work and Get in touch, in that order", () => {
  const { container } = render(<AboutPage {...props} />);
  const actions = container.querySelector("header [data-reveal-delay='0.45']")!;
  const links = [...actions.querySelectorAll("a")];
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    "/work",
    "/#contact",
    "/cv/Marwan-Elsayed-CV.pdf",
  ]);
  expect(links[2].hasAttribute("download")).toBe(true);
});

it("shows the portrait with its description, printed in from the left", () => {
  const { container } = render(<AboutPage {...props} />);
  const portrait = container.querySelector<HTMLElement>("[data-about-portrait]")!;
  expect(portrait.dataset.reveal).toBe("print");
  const image = within(portrait).getByRole("img", { name: aboutPage.portrait.alt });
  expect(image.hasAttribute("data-print-picture")).toBe(true);
  expect(screen.getByText("Marwan Elsayed / Front-end engineer / Cairo")).toBeTruthy();
  // The mark sits on the frame behind the photo and is hidden from assistive technology.
  const mark = portrait.querySelector("svg")!;
  expect(mark.getAttribute("aria-hidden")).toBe("true");
  expect(mark.hasAttribute("role")).toBe(false);
  expect(mark.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("has a numbered band for each part of the owner's content, in order", () => {
  render(<AboutPage {...props} />);
  expect(headings()).toEqual([
    aboutPage.current.title,
    aboutPage.areas.title,
    aboutPage.approach.title,
    aboutPage.experience.title,
    aboutPage.profiles.title,
  ]);
  for (const text of [
    "01 / Current work",
    "02 / Areas of work",
    "03 / Approach",
    "04 / Experience",
    "05 / Profiles",
  ])
    expect(screen.getByText(text)).toBeTruthy();
});

it("omits bands that have no content and keeps the numbers in a row", () => {
  render(
    <AboutPage
      {...props}
      content={{ introduction: ["Only this."], approach: [], background: [] }}
      technologies={[]}
    />,
  );
  expect(headings()).toEqual([
    aboutPage.current.title,
    aboutPage.areas.title,
    aboutPage.profiles.title,
  ]);
  expect(screen.getByText("03 / Profiles")).toBeTruthy();
  expect(screen.queryByText(aboutPage.approach.toolsLabel)).toBeNull();
});

it("links the current work, the two areas and the profiles", () => {
  render(<AboutPage {...props} />);
  for (const work of props.currentWork)
    expect(screen.getByRole("link", { name: work.label }).getAttribute("href")).toBe(work.href);
  expect(screen.getByRole("link", { name: /Websites & E-commerce/ }).getAttribute("href")).toBe(
    "/work#websites-ecommerce",
  );
  expect(screen.getByRole("link", { name: /SaaS & Dashboards/ }).getAttribute("href")).toBe(
    "/work#saas-dashboards",
  );
  const profiles = within(screen.getByRole("navigation", { name: aboutPage.profiles.label }));
  expect(profiles.getByRole("link", { name: "Email" }).getAttribute("href")).toBe(
    "mailto:me@example.com",
  );
  for (const profile of props.profiles) {
    const link = profiles.getByRole("link", { name: new RegExp(`^${profile.label}`) });
    expect(link.getAttribute("href")).toBe(profile.url);
    expect(link.getAttribute("target")).toBe("_blank");
  }
});

it("offers no email when the site has none", () => {
  render(<AboutPage {...props} email={null} />);
  const profiles = within(screen.getByRole("navigation", { name: aboutPage.profiles.label }));
  expect(profiles.queryByRole("link", { name: "Email" })).toBeNull();
  expect(profiles.getAllByRole("link")).toHaveLength(2);
});

it("lists the roles with their employers and counts the tools", () => {
  const { container } = render(<AboutPage {...props} />);
  for (const entry of aboutContent.experience ?? [])
    expect(screen.getByText(entry.detail)).toBeTruthy();
  expect(screen.getByText("React")).toBeTruthy();
  for (const entry of aboutContent.experience ?? []) expect(entry.place).toBeTruthy();
  expect(container.textContent).toMatch(/Webelocity/);
  expect(container.textContent).not.toMatch(/Link Investment|e-RAMO/i);
});
