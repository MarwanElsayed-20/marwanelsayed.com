import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { servicePageLabels, servicesPage } from "@/content/site/services";
import { resolvedServices } from "@/lib/projects/services";
import { ServiceDetailPage } from "./service-detail-page";

afterEach(cleanup);

const service = resolvedServices[0];
const others = resolvedServices.slice(1);
const page = () => render(<ServiceDetailPage service={service} others={others} />);

it("opens with the crumb, the title, the answer and the way to get in touch", () => {
  page();
  expect(screen.getByRole("heading", { level: 1, name: service.page.title })).toBeTruthy();
  expect(screen.getByRole("link", { name: servicePageLabels.crumb }).getAttribute("href")).toBe(
    "/services",
  );
  expect(screen.getByText(service.page.answer)).toBeTruthy();
  // The hero and the closing band each offer it.
  const touch = screen.getAllByRole("link", { name: servicesPage.askLabel });
  expect(touch).toHaveLength(2);
  for (const link of touch) expect(link.getAttribute("href")).toBe("/#contact");
  // Get in touch stands alone: no email address is offered beside it.
  expect(document.querySelector("a[href^='mailto:']")).toBeNull();
});

it("shows what you get with who it is for, the points and the work that shows it", () => {
  page();
  const section = within(
    screen.getByRole("heading", { level: 2, name: servicePageLabels.included }).closest("section")!,
  );
  expect(section.getByText(service.audience)).toBeTruthy();
  for (const point of service.page.points) expect(section.getByText(point)).toBeTruthy();
  for (const work of service.seen)
    expect(section.getByRole("link", { name: work.label }).getAttribute("href")).toBe(work.href);
});

it("puts the cover and a second picture on the page, both decoration made for it", () => {
  const { container } = page();
  const stages = [...container.querySelectorAll<HTMLElement>("[data-service-stage]")];
  expect(stages.map((stage) => stage.dataset.stageShape)).toEqual(["card", "wide"]);
  for (const stage of stages) {
    expect(stage.dataset.serviceStage).toBe(service.id);
    expect(stage.getAttribute("aria-hidden")).toBe("true");
  }
  expect(stages[1].parentElement!.className).toContain("lg:sticky");
  expect(container.querySelectorAll("img")).toHaveLength(0);
});

it("answers the service's own questions and runs through the shared steps", () => {
  page();
  for (const item of service.page.faq) {
    expect(screen.getByText(item.question)).toBeTruthy();
    expect(screen.getByText(item.answer)).toBeTruthy();
  }
  for (const step of servicesPage.how.steps) expect(screen.getByText(step)).toBeTruthy();
});

it("lists the other services, never itself, and links back to all of them", () => {
  page();
  const nav = within(screen.getByRole("navigation", { name: servicePageLabels.otherTitle }));
  const links = nav.getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    ...others.map((other) => other.href),
    "/services",
  ]);
  expect(nav.queryByRole("link", { name: service.name })).toBeNull();
  expect(nav.getByRole("link", { name: servicePageLabels.otherAll })).toBeTruthy();
});

it("closes with the band", () => {
  page();
  expect(screen.getByRole("heading", { level: 2, name: servicesPage.close.title })).toBeTruthy();
  expect(screen.getByText(servicesPage.close.line)).toBeTruthy();
});

it("is the same for every service: one h1, labelled sections, no off-site link and no email", () => {
  for (const item of resolvedServices) {
    const { container, unmount } = render(
      <ServiceDetailPage
        service={item}
        others={resolvedServices.filter((entry) => entry.id !== item.id)}
      />,
    );
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    for (const section of container.querySelectorAll("section, nav"))
      expect(section.getAttribute("aria-labelledby"), item.id).toBeTruthy();
    for (const link of container.querySelectorAll("a"))
      expect(link.getAttribute("href")?.startsWith("http"), item.id).toBe(false);
    unmount();
  }
});
