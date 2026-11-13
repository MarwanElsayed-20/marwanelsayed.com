import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CaseStudy } from "./case-study";
import type { Project } from "@/lib/projects/types";
vi.mock("./screen-viewer-lazy", async () => ({
  ScreenViewerLazy: (await import("./screen-viewer")).ScreenViewer,
}));
afterEach(cleanup);
const project: Project = {
  slug: "test",
  title: "A project",
  category: "e-commerce",
  summary: "A summary",
  builtWith: ["Next.js"],
};
it("shows one hero, label, scope, technologies and an eager capture", () => {
  render(
    <CaseStudy
      project={{
        ...project,
        scope: "Implemented the checkout flow",
        image: {
          src: "/projects/test.webp",
          width: 800,
          height: 500,
          alt: "Checkout capture",
          kind: "capture",
          caption: "Checkout.",
        },
      }}
      kind="digital-experiences"
      category="E-commerce"
      productLabel="Product"
    />,
  );
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByText("What I implemented")).toBeTruthy();
  expect(screen.getByText("Product")).toBeTruthy();
  expect(screen.getByText("Screens use sample data to protect client information.")).toBeTruthy();
  expect(screen.getByRole("img").getAttribute("loading")).toBe("eager");
});
it("omits scope and renders the shared placeholder without an image", () => {
  const { container } = render(
    <CaseStudy project={project} kind="digital-experiences" category="E-commerce" />,
  );
  expect(screen.queryByText("What I implemented")).toBeNull();
  expect(container.querySelector("[data-preview-frame]")).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
});

it("renders ordered sections, results, features and decisions with lazy native walkthroughs", () => {
  const { container } = render(
    <CaseStudy
      project={{
        ...project,
        context: ["Context"],
        outcomes: ["Result"],
        screens: [
          {
            src: "/projects/test.webp",
            width: 900,
            height: 600,
            alt: "Screen capture",
            caption: "Screen.",
          },
        ],
        features: [{ title: "Checkout", points: ["Choose delivery"] }],
        approach: ["Architecture lead"],
        decisions: [{ title: "Server rendering", detail: "Keeps content readable" }],
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
    "Overview and scope",
    "Walkthrough",
    "Features and flows",
    "Architecture and decisions",
    "Technologies",
  ]);
  expect(screen.getByRole("heading", { name: "Results" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Checkout" })).toBeTruthy();
  expect(screen.getByText("Choose delivery")).toBeTruthy();
  expect(screen.getByText("Keeps content readable")).toBeTruthy();
  expect(container.querySelector("#walkthrough img")?.getAttribute("loading")).toBe("lazy");
  expect(container.querySelector("#walkthrough figcaption")?.textContent).toContain("Screen.");
  expect(screen.queryByText("Responsive and states")).toBeNull();
});

it("groups real phone and state captures separately with captions", () => {
  const image = { src: "/projects/test.webp", width: 400, height: 800, alt: "Mobile capture" };
  const { container } = render(
    <CaseStudy
      project={{
        ...project,
        screens: [
          { ...image, view: "phone", caption: "Phone registration." },
          { ...image, view: "state", caption: "Empty form." },
        ],
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(screen.getByRole("heading", { name: "Responsive and states", level: 3 })).toBeTruthy();
  expect(container.querySelectorAll("#walkthrough figcaption")).toHaveLength(1);
  expect(screen.getByRole("group", { name: "Responsive and states screens" })).toBeTruthy();
  expect(container.querySelector("noscript")).toBeTruthy();
  expect(container.querySelectorAll("#walkthrough img[loading=lazy]")).toHaveLength(3);
});

it("zero screens omits Walkthrough and its outline entry", () => {
  const { container } = render(
    <CaseStudy project={project} kind="digital-experiences" category="E-commerce" />,
  );
  expect(container.querySelector("#walkthrough")).toBeNull();
  expect(screen.queryByRole("group", { name: "Walkthrough screens" })).toBeNull();
  expect(container.querySelector('a[href="#walkthrough"]')).toBeNull();
});
it("single screen uses a viewer with full size and no navigation", () => {
  render(
    <CaseStudy
      project={{
        ...project,
        screens: [{ src: "/projects/test.webp", width: 800, height: 500, alt: "Only screen" }],
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(screen.getByRole("group", { name: "Walkthrough screens" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "View full size" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  expect(screen.queryByRole("button", { name: /Show screen/ })).toBeNull();
});
it("lists start, status, role, area and stack as facts in the header", () => {
  const { container } = render(
    <CaseStudy
      project={{
        ...project,
        period: "2024",
        progress: "completed",
        builtWith: ["Next.js", "TypeScript"],
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  const facts = [...container.querySelectorAll("header dl dt")].map((dt) => dt.textContent);
  expect(facts).toEqual(["Started", "Status", "Role", "Area", "Stack"]);
  expect(container.querySelector("header dl")?.textContent).toContain("Next.js, TypeScript");
});
it("omits the facts it has no data for", () => {
  const { container } = render(
    <CaseStudy
      project={{ ...project, builtWith: [] }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect([...container.querySelectorAll("header dl dt")].map((dt) => dt.textContent)).toEqual([
    "Role",
    "Area",
  ]);
});
it("gives the role from the page's own record, the usual one by default", () => {
  const { container, rerender } = render(
    <CaseStudy project={project} kind="digital-experiences" category="E-commerce" />,
  );
  const role = () => container.querySelector("header dl")?.textContent ?? "";
  expect(role()).toContain("Front-end developer");
  rerender(
    <CaseStudy
      project={{ ...project, slug: "wajihni" }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(role()).toContain("Full-stack developer");
});
it("marks its reveals: sections rise, the hero capture opens, lists come in one by one", () => {
  const { container } = render(
    <CaseStudy
      project={{
        ...project,
        context: ["Context"],
        outcomes: ["Result"],
        builtWith: ["Next.js"],
        decisions: [{ title: "Choice", detail: "Reason" }],
        image: { src: "/projects/test.webp", width: 800, height: 500, alt: "Capture" },
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(container.querySelectorAll('[data-reveal="open"]')).toHaveLength(1);
  expect(container.querySelector('[data-reveal="open"] img')).toBeTruthy();
  expect(container.querySelectorAll(".case-chapter[data-reveal='scene']").length).toBeGreaterThan(
    1,
  );
  expect(container.querySelectorAll('[data-reveal="stagger"]').length).toBeGreaterThan(1);
  // The delays are 0, 0.045 or 0.09 seconds.
  const delays = [...container.querySelectorAll('[data-reveal="scene"][data-reveal-delay]')].map(
    (element) => element.getAttribute("data-reveal-delay"),
  );
  expect(delays.every((delay) => ["0.000", "0.045", "0.090"].includes(delay ?? ""))).toBe(true);
});
it("sets the screens chapter apart as the dark one, on a light plate", () => {
  const { container } = render(
    <CaseStudy
      project={{
        ...project,
        context: ["Context"],
        screens: [{ src: "/projects/test.webp", width: 800, height: 500, alt: "Screen" }],
      }}
      kind="digital-experiences"
      category="E-commerce"
    />,
  );
  expect(container.querySelector("#walkthrough")?.getAttribute("data-tone")).toBe("dark");
  expect(container.querySelector("#overview")?.getAttribute("data-tone")).toBe("light");
  expect(container.querySelector("#walkthrough .case-plate [data-screen-viewer]")).toBeTruthy();
});
