import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { servicesPage } from "@/content/site/services";
import { resolvedServices } from "@/lib/projects/services";
import { ServicesPage } from "./services-page";

afterEach(cleanup);

const page = () => render(<ServicesPage services={resolvedServices} />);

it("opens with the title, the lead, the way to get in touch and no email", () => {
  page();
  expect(screen.getByRole("heading", { level: 1, name: servicesPage.title })).toBeTruthy();
  expect(screen.getByText(servicesPage.introduction)).toBeTruthy();
  const touch = screen.getAllByRole("link", { name: servicesPage.askLabel });
  for (const link of touch) expect(link.getAttribute("href")).toBe("/#contact");
  // Get in touch stands alone: no email address is offered beside it.
  const { container } = page();
  expect(container.querySelector("a[href^='mailto:']")).toBeNull();
  expect(container.textContent).not.toMatch(/@/);
});

it("jumps to every service from a numbered list that matches the sections", () => {
  const { container } = page();
  const jump = screen.getByRole("navigation", { name: servicesPage.jumpLabel });
  const links = within(jump).getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual(
    resolvedServices.map((item) => `#${item.id}`),
  );
  for (const item of resolvedServices) {
    const section = container.querySelector(`section#${item.id}`)!;
    expect(section.getAttribute("aria-labelledby")).toBe(`${item.id}-title`);
    expect(section.querySelector(`#${item.id}-title`)?.textContent).toBe(item.name);
  }
  expect(jump.getAttribute("data-reveal")).toBe("ledger");
});

it("shows each service once: who it is for, what you get, the work that shows it and its page", () => {
  const { container } = page();
  for (const item of resolvedServices) {
    const section = within(container.querySelector<HTMLElement>(`section#${item.id}`)!);
    expect(section.getByRole("heading", { level: 2, name: item.name })).toBeTruthy();
    expect(section.getByText(item.number)).toBeTruthy();
    expect(section.getByText(item.audience)).toBeTruthy();
    for (const point of item.page.points) expect(section.getByText(point), point).toBeTruthy();
    for (const work of item.seen)
      expect(section.getByRole("link", { name: work.label }).getAttribute("href")).toBe(work.href);
    expect(
      section.getByRole("link", { name: `${item.name}: full details` }).getAttribute("href"),
    ).toBe(item.href);
    expect(
      section.getByRole("heading", { level: 2 }).querySelector("a")?.getAttribute("href"),
    ).toBe(item.href);
  }
});

it("alternates the picture from one side to the other and keeps it beside the text on a wide screen", () => {
  const { container } = page();
  const stages = [...container.querySelectorAll<HTMLElement>("[data-service-stage]")];
  expect(stages.map((stage) => stage.dataset.serviceStage)).toEqual(
    resolvedServices.map((item) => item.id),
  );
  const sides = stages.map((stage) => stage.parentElement!.className.includes("lg:order-first"));
  expect(sides).toEqual([false, true, false, true]);
  for (const stage of stages) {
    expect(stage.getAttribute("aria-hidden")).toBe("true");
    expect(stage.parentElement!.className).toContain("lg:sticky");
    expect(stage.getAttribute("data-reveal")).toBe("print");
  }
});

it("draws the lists in as ledgers and uses generated artwork only", () => {
  const { container } = page();
  const ledgers = [...container.querySelectorAll("[data-reveal='ledger']")].map(
    (node) => node.tagName,
  );
  // The jump list, one list per service, the steps and the questions.
  expect(ledgers.filter((tag) => tag === "UL")).toHaveLength(resolvedServices.length);
  expect(ledgers.filter((tag) => tag === "NAV")).toHaveLength(1);
  expect(ledgers.filter((tag) => tag === "OL")).toHaveLength(1);
  expect(ledgers.filter((tag) => tag === "DL")).toHaveLength(1);
  expect(container.querySelectorAll("img")).toHaveLength(0);
});

it("closes with how a project runs, the first questions and the closing band", () => {
  page();
  expect(screen.getByRole("heading", { level: 2, name: servicesPage.how.title })).toBeTruthy();
  for (const step of servicesPage.how.steps) expect(screen.getByText(step)).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2, name: servicesPage.faq.title })).toBeTruthy();
  for (const item of servicesPage.faq.items) {
    expect(screen.getByText(item.question)).toBeTruthy();
    expect(screen.getByText(item.answer)).toBeTruthy();
  }
  expect(screen.getByRole("heading", { level: 2, name: servicesPage.close.title })).toBeTruthy();
});
