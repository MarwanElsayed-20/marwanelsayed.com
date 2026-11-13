import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { selectedWorkContent } from "@/content/site/selected-work";
import { selectedScenes } from "@/lib/projects/selected-work";
import { SelectedWork } from "./selected-work";

afterEach(cleanup);

it("titles the section and introduces it", () => {
  render(<SelectedWork scenes={selectedScenes} />);
  expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeTruthy();
  expect(screen.getByText(selectedWorkContent.introduction)).toBeTruthy();
});

it("offers a button under the introduction that opens the work list", () => {
  render(<SelectedWork scenes={selectedScenes} />);
  const link = screen.getByRole("link", { name: "View all work" });
  expect(link.getAttribute("href")).toBe("/work");
  const intro = screen.getByText(selectedWorkContent.introduction);
  expect(intro.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("gives every scene its label, title, summary and case-study links in its own colours", () => {
  const { container } = render(<SelectedWork scenes={selectedScenes} />);
  const scenes = container.querySelectorAll<HTMLElement>("[data-scene]");
  expect([...scenes].map((scene) => scene.dataset.tone)).toEqual([
    "toolswift",
    "smooth-erp",
    "aligna",
    "wajihni",
  ]);
  selectedScenes.forEach((scene, index) => {
    const element = within(scenes[index]);
    expect(element.getByRole("heading", { level: 3, name: scene.name })).toBeTruthy();
    expect(
      element.getByText(`${scene.number} / ${scene.label[0]} / ${scene.label[1]}`),
    ).toBeTruthy();
    expect(element.getByText(scene.summary)).toBeTruthy();
    for (const link of scene.links)
      expect(
        element
          .getAllByRole("link", { name: new RegExp(`^${link.label}`) })
          .some((a) => a.getAttribute("href") === link.href),
      ).toBe(true);
  });
});

it("marks the dark scenes for the cursor and keeps the artwork out of the reading order", () => {
  const { container } = render(<SelectedWork scenes={selectedScenes} />);
  const dark = [...container.querySelectorAll<HTMLElement>('[data-scene][data-surface="dark"]')];
  expect(dark.map((scene) => scene.dataset.scene)).toEqual(["toolswift", "wajihni"]);
  for (const art of container.querySelectorAll("[data-scene-art]")) {
    expect(art.getAttribute("aria-hidden")).toBe("true");
    for (const link of art.querySelectorAll("a")) expect(link.getAttribute("tabindex")).toBe("-1");
  }
});

it("links each intro print to its scene, and never leaves the site", () => {
  const { container } = render(<SelectedWork scenes={selectedScenes} />);
  const prints = [...container.querySelectorAll<HTMLAnchorElement>("[data-intro-print]")];
  expect(prints.map((print) => print.getAttribute("href"))).toEqual(
    selectedScenes.map((scene) => `#scene-${scene.id}`),
  );
  for (const scene of selectedScenes)
    expect(container.querySelector(`#scene-${scene.id}`)).toBeTruthy();
  for (const link of container.querySelectorAll("a"))
    expect(link.getAttribute("href")?.startsWith("http")).toBe(false);
});
