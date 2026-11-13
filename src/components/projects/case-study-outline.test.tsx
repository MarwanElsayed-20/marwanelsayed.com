import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CaseStudyOutline } from "./case-study-outline";
afterEach(cleanup);
it("renders only supplied anchors in desktop nav and native mobile details", () => {
  const { container } = render(
    <CaseStudyOutline
      sections={[
        { id: "overview", title: "Overview and scope" },
        { id: "technologies", title: "Technologies" },
      ]}
    />,
  );
  expect(container.querySelectorAll('nav[aria-label="On this page"]')).toHaveLength(2);
  expect(container.querySelector("summary")?.textContent).toBe("On this page");
  expect(container.querySelectorAll('a[href="#overview"]')).toHaveLength(2);
  expect(container.querySelector('a[href="#features"]')).toBeNull();
});
it("renders nothing with no sections", () => {
  const { container } = render(<CaseStudyOutline sections={[]} />);
  expect(container.innerHTML).toBe("");
});
it("progressively highlights the current section and cleans up its observer", () => {
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = observe;
      disconnect = disconnect;
    },
  );
  const { container, unmount } = render(
    <>
      <CaseStudyOutline sections={[{ id: "overview", title: "Overview and scope" }]} />
      <section id="overview" />
    </>,
  );
  expect(observe).toHaveBeenCalled();
  expect(container.querySelector('a[aria-current="location"]')).toBeTruthy();
  fireEvent.scroll(window);
  unmount();
  expect(disconnect).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
