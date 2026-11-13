import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { servicesContent } from "@/content/site/services";
import { resolvedServices } from "@/lib/projects/services";
import { Services } from "./services";

afterEach(cleanup);

it("titles the section, introduces it and offers contact and the services page", () => {
  render(<Services services={resolvedServices} />);
  expect(screen.getByRole("heading", { level: 2, name: servicesContent.heading })).toBeTruthy();
  expect(screen.getByText(servicesContent.introduction)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Get in touch" }).getAttribute("href")).toBe("/#contact");
  expect(screen.getByRole("link", { name: "All services in detail" }).getAttribute("href")).toBe(
    "/services",
  );
});

it("lists every service with who it is for, what it includes and the work that shows it", () => {
  const { container } = render(<Services services={resolvedServices} />);
  const rows = [...container.querySelectorAll<HTMLElement>("[data-service]")];
  expect(rows.map((row) => row.dataset.service)).toEqual(resolvedServices.map((item) => item.id));
  resolvedServices.forEach((item, index) => {
    const row = within(rows[index]);
    expect(row.getByRole("heading", { level: 3, name: item.name })).toBeTruthy();
    expect(row.getByText(item.number)).toBeTruthy();
    expect(row.getByText(item.audience)).toBeTruthy();
    expect(row.getByText(item.includes)).toBeTruthy();
    for (const work of item.seen)
      expect(row.getByRole("link", { name: work.label }).getAttribute("href"), work.label).toBe(
        work.href,
      );
    expect(row.getByRole("link", { name: `${item.name}: details` }).getAttribute("href")).toBe(
      item.href,
    );
  });
});

it("keeps the artwork out of the reading order and never leaves the site", () => {
  const { container } = render(<Services services={resolvedServices} />);
  const plate = container.querySelector("[data-services-plate]")!;
  expect(plate.getAttribute("aria-hidden")).toBe("true");
  expect(plate.getAttribute("data-surface")).toBe("dark");
  for (const link of plate.querySelectorAll("a")) expect(link.getAttribute("tabindex")).toBe("-1");
  // Generated artwork only: no project capture appears in this section.
  expect(container.querySelectorAll("img")).toHaveLength(0);
  for (const picture of container.querySelectorAll("svg[data-print-picture]"))
    expect(picture.getAttribute("aria-hidden")).toBe("true");
  const tiles = container.querySelectorAll("[data-service-tile]");
  expect(tiles).toHaveLength(resolvedServices.length);
  for (const tile of tiles) {
    expect(tile.getAttribute("aria-hidden")).toBe("true");
    expect(tile.getAttribute("tabindex")).toBe("-1");
  }
  for (const link of container.querySelectorAll("a"))
    expect(link.getAttribute("href")?.startsWith("http")).toBe(false);
});

it("lays one plate piece per service, each numbered and linked like its row", () => {
  const { container } = render(<Services services={resolvedServices} />);
  const pieces = [...container.querySelectorAll("[data-services-plate] a[data-plate-piece]")];
  expect(pieces.map((piece) => piece.getAttribute("href"))).toEqual(
    resolvedServices.map((item) => item.href),
  );
  const numbers = [...container.querySelectorAll("[data-services-plate] [data-plate-number]")];
  expect(numbers.map((node) => node.textContent)).toEqual(resolvedServices.map((i) => i.number));
});
