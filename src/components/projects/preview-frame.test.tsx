import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PreviewFrame } from "./preview-frame";
afterEach(cleanup);
const image = {
  src: "/projects/test.webp",
  width: 1600,
  height: 1000,
  alt: "Real dashboard capture with sample data",
};
it("keeps one aspect and the capture's meaningful alt, with lazy loading by default", () => {
  const { container } = render(<PreviewFrame title="Test" image={image} />);
  const img = screen.getByRole("img");
  expect(img.getAttribute("alt")).toBe(image.alt);
  expect(img.getAttribute("loading")).toBe("lazy");
  expect(img.className).toContain("object-top");
  expect(container.querySelector(".aspect-\\[16\\/10\\]")).toBeTruthy();
});
it("loads priority captures eagerly", () => {
  render(<PreviewFrame title="Test" image={image} priority />);
  expect(screen.getByRole("img").getAttribute("loading")).toBe("eager");
});
it("uses a lettered placeholder without an image", () => {
  render(<PreviewFrame title="Test" />);
  expect(screen.getByText("T").getAttribute("aria-hidden")).toBe("true");
  expect(screen.queryByRole("img")).toBeNull();
});

it("uses the image native proportions without cropping", () => {
  const { container } = render(
    <PreviewFrame title="Test" image={{ ...image, width: 800, height: 1200 }} aspect="native" />,
  );
  expect(container.querySelector("[style]")?.getAttribute("style")).toContain("800 / 1200");
  expect(screen.getByRole("img").className).toContain("object-contain");
});
