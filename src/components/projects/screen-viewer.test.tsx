import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { ScreenViewer } from "./screen-viewer";
import type { ProjectImage } from "@/lib/projects/types";
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  window.scrollTo = () => {};
});
afterEach(cleanup);
const screens: ProjectImage[] = [
  {
    src: "/projects/one.webp",
    width: 800,
    height: 1600,
    alt: "First alt",
    caption: "First caption",
  },
  {
    src: "/projects/two.webp",
    width: 1600,
    height: 800,
    alt: "Second alt",
    caption: "Second caption",
  },
  { src: "/projects/three.webp", width: 800, height: 600 },
];
function setup(images = screens) {
  return render(<ScreenViewer screens={images} title="Project" label="Walkthrough" />);
}
it("keeps image, caption, position, ends and announcement together through buttons and keys", () => {
  const { container } = setup();
  const group = screen.getByRole("group", { name: "Walkthrough screens" });
  const next = screen.getByRole("button", { name: "Next" });
  const previous = screen.getByRole("button", { name: "Previous" });
  expect((previous as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole("img", { name: "First alt" })).toBeTruthy();
  fireEvent.click(next);
  expect(screen.getAllByText("2 of 3")[0]).toBeTruthy();
  expect(screen.getByRole("img", { name: "Second alt" })).toBeTruthy();
  expect(container.querySelector("[aria-live]")?.textContent).toBe("Screen 2 of 3: Second caption");
  fireEvent.click(previous);
  fireEvent.keyDown(group, { key: "End" });
  expect((next as HTMLButtonElement).disabled).toBe(true);
  expect(
    screen.getByRole("button", { name: "Show screen 3: Screen 3" }).getAttribute("aria-current"),
  ).toBe("true");
  fireEvent.keyDown(group, { key: "ArrowLeft" });
  expect(screen.getAllByText("2 of 3")[0]).toBeTruthy();
  fireEvent.keyDown(group, { key: "Home" });
  fireEvent.keyDown(group, { key: "ArrowRight" });
  expect(screen.getAllByText("2 of 3")[0]).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show screen 1: First caption" }));
  expect(screen.getAllByText("1 of 3")[0]).toBeTruthy();
  fireEvent.keyDown(group, { key: "Enter" });
  expect(screen.getAllByText("1 of 3")[0]).toBeTruthy();
  expect(within(group).queryAllByRole("heading")).toHaveLength(0);
  expect(within(group).queryAllByRole("link")).toHaveLength(0);
});
it("uses existing alt/caption fallbacks and a letter fallback for failed images", () => {
  setup([{ ...screens[0], caption: undefined }, { ...screens[1], alt: undefined }, screens[2]]);
  fireEvent.error(screen.getByRole("img", { name: "First alt" }));
  expect(screen.getByRole("img", { name: "First alt" }).textContent).toBe("P");
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("img", { name: "Second caption" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByRole("img", { name: "Screen 3" })).toBeTruthy();
});
it("handles rapid activation without stale indices", () => {
  setup();
  const next = screen.getByRole("button", { name: "Next" });
  for (let i = 0; i < 10; i++) fireEvent.click(next);
  expect(screen.getAllByText("3 of 3")[0]).toBeTruthy();
});

it("opens the current capture in a native dialog, navigates, closes and returns focus", () => {
  const { container } = setup();
  const open = screen.getByRole("button", { name: "View full size" });
  open.focus();
  fireEvent.click(open);
  const dialog = screen.getByRole("dialog", { name: "Project First caption" });
  expect(dialog).toBeInstanceOf(HTMLDialogElement);
  fireEvent.click(within(dialog).getByRole("button", { name: "Next" }));
  expect(within(dialog).getByRole("img", { name: "Second alt" })).toBeTruthy();
  expect(screen.getByRole("dialog", { name: "Project Second caption" })).toBeTruthy();
  fireEvent.keyDown(dialog, { key: "Home" });
  expect(within(dialog).getByRole("img", { name: "First alt" })).toBeTruthy();
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(open);
  fireEvent.click(open);
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(container.querySelector("dialog[open]")).toBeNull();
  expect(document.activeElement).toBe(open);
  expect(document.documentElement.style.overflow).toBe("");
});

it("single screen keeps full size and omits navigation, position and thumbnails", () => {
  const { container } = setup([screens[0]]);
  expect(screen.getByRole("button", { name: "View full size" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
  expect(screen.queryByRole("list")).toBeNull();
  expect(container.querySelector("[data-screen-position]")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "View full size" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByRole("img", { name: "First alt" })).toBeTruthy();
  expect(
    within(dialog)
      .getAllByRole("button")
      .map((el) => el.textContent),
  ).toEqual(["Close"]);
});
it("zero screens renders no group or controls", () => {
  const { container } = setup([]);
  expect(container.innerHTML).toBe("");
});

it("wraps boundary Tab presses inside the native dialog and exposes keyboard scrolling", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "View full size" }));
  const dialog = screen.getByRole("dialog");
  const close = within(dialog).getByRole("button", { name: "Close" });
  const next = within(dialog).getByRole("button", { name: "Next" });
  const area = within(dialog).getByRole("region", { name: "Full-size screen" });
  expect(area.tabIndex).toBe(0);
  next.focus();
  fireEvent.keyDown(next, { key: "Tab" });
  expect(document.activeElement).toBe(close);
  fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(next);
});
