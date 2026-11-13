import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { WhatsAppButton } from "./whatsapp-button";

afterEach(cleanup);

it("is a labelled link to the chat that opens in a new tab and never calls", () => {
  render(<WhatsAppButton number="201114766628" />);
  const link = screen.getByRole("link", { name: /^WhatsApp/ });
  expect(link.getAttribute("href")).toBe("https://wa.me/201114766628");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toContain("noopener");
  expect(link.getAttribute("href")).not.toMatch(/^tel:/);
  expect(link.textContent).toContain("opens in a new tab");
  expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});
