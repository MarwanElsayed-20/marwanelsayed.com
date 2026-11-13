import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { cvDownload } from "@/content/site/cv";
import { CvButton } from "./cv-button";

afterEach(cleanup);

it("is a download link named for the CV, with the file type said to assistive technology", () => {
  render(<CvButton />);
  const link = screen.getByRole("link", { name: /^CV/ });
  expect(link.textContent).toBe("CV (PDF download)");
  expect(link.getAttribute("href")).toBe(cvDownload.href);
  expect(link.getAttribute("download")).toBe(cvDownload.fileName);
  expect(link.getAttribute("target")).toBeNull();
  expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

it("points at a real PDF in public", () => {
  const file = join(process.cwd(), "public", cvDownload.href);
  expect(existsSync(file)).toBe(true);
  expect(readFileSync(file).subarray(0, 5).toString()).toBe("%PDF-");
});
