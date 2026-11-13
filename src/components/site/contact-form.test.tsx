import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function fill(email = "sam@studio.co", message = "I would like a storefront.") {
  fireEvent.click(screen.getByLabelText("A project"));
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("What are you building?"), { target: { value: message } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
}

it("explains invalid input, focuses the first problem and sends nothing", () => {
  render(<ContactForm email="me@example.com" />);
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(document.activeElement).toBe(screen.getByLabelText("A project"));
  expect(screen.getByText("Choose what you are reaching out about.")).toBeTruthy();
  expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("Enter your email address so I can reply.")).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("confirms only after the server says the message was delivered", async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  render(<ContactForm email="me@example.com" />);
  fill();
  expect(screen.queryByText("Message sent.")).toBeNull();
  await screen.findByText("Message sent.");
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/api/contact");
  expect(JSON.parse(init.body)).toMatchObject({
    topic: "project",
    email: "sam@studio.co",
    fax: "",
  });
});

it("says plainly when delivery is not configured and offers the address", async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ error: "not-configured" }), { status: 503 }),
  );
  render(<ContactForm email="me@example.com" />);
  fill();
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("not connected yet");
  expect(screen.getByRole("link", { name: "me@example.com" }).getAttribute("href")).toBe(
    "mailto:me@example.com",
  );
  expect(screen.queryByText("Message sent.")).toBeNull();
});

it("keeps what was typed after a network failure", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  render(<ContactForm email={null} />);
  fill("kim@studio.co", "Please call me back soon.");
  await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("kim@studio.co");
  expect(screen.queryByRole("link")).toBeNull();
});

it("shows only the chosen topic's details and fits the message label to it", () => {
  render(<ContactForm email={null} />);
  expect(screen.queryByLabelText(/Budget/)).toBeNull();
  expect(screen.queryByLabelText(/Company/)).toBeNull();
  fireEvent.click(screen.getByLabelText("A project"));
  expect(screen.getByLabelText(/Budget/)).toBeTruthy();
  expect(screen.getByLabelText("Online store")).toBeTruthy();
  expect(screen.getByLabelText("What are you building?")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("A job opportunity"));
  expect(screen.queryByLabelText(/Budget/)).toBeNull();
  expect(screen.getByLabelText(/Company/)).toBeTruthy();
  expect(screen.getByLabelText(/Role/)).toBeTruthy();
  expect(screen.getByLabelText("Tell me about the role")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Something else"));
  expect(screen.getByLabelText("Your message")).toBeTruthy();
});

it("sends a job's company and role", async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  render(<ContactForm email={null} />);
  fireEvent.click(screen.getByLabelText("A job opportunity"));
  fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "Acme" } });
  fireEvent.change(screen.getByLabelText(/Role/), { target: { value: "Front-end engineer" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "hr@acme.co" } });
  fireEvent.change(screen.getByLabelText("Tell me about the role"), {
    target: { value: "A senior front-end role on our platform team." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Message sent.");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
    topic: "job",
    company: "Acme",
    role: "Front-end engineer",
    budget: "",
  });
});
