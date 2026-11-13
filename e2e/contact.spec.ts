import { expect, test, type Page } from "./fixtures";
import { contactDetails } from "../src/content/site/contact";

// The contact route delivers to a local stand-in for Resend (see playwright.config.ts).
const MOCK = "http://127.0.0.1:3999";

type Last = {
  count: number;
  last: {
    authorization: string;
    payload: {
      from: string;
      to: string[];
      reply_to: string;
      subject: string;
      html: string;
      text: string;
    };
  } | null;
};

const lastEmail = async (): Promise<Last> => (await fetch(`${MOCK}/_last`)).json();

test.beforeEach(async () => {
  await fetch(`${MOCK}/_last`, { method: "DELETE" });
});

async function open(page: Page) {
  await page.goto("/?hero=fallback");
  const form = page.locator("#contact form");
  await form.scrollIntoViewIfNeeded();
  return form;
}

test("invalid input is explained next to the field and nothing is sent", async ({ page }) => {
  const form = await open(page);
  let posted = false;
  page.on("request", (request) => {
    if (request.url().includes("/api/contact")) posted = true;
  });
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form.getByLabel("A project")).toBeFocused();
  await expect(form.getByText("Choose what you are reaching out about.")).toBeVisible();
  const email = form.getByLabel("Email");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText("Enter your email address so I can reply.")).toBeVisible();
  await expect(form.getByText("Write your message.")).toBeVisible();
  await form.getByText("A project").click();
  await email.fill("not-an-email");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form.getByText(/valid email address/)).toBeVisible();
  expect(posted).toBe(false);
  expect((await lastEmail()).count).toBe(0);
});

test("a valid message is delivered as a designed email and only then confirmed", async ({
  page,
}) => {
  const form = await open(page);
  await form.getByText("A project").click();
  await form.getByText("Online store").click();
  await form.getByLabel(/Budget/).selectOption({ label: "$3,000 – $10,000" });
  await form.getByLabel(/Name/).fill("Sam <b>Rivera</b>");
  await form.getByLabel("Email").fill("sam@studio.co");
  await form.getByLabel(/Phone or WhatsApp/).fill("+20 111 000 0000");
  await form.getByRole("textbox", { name: /Website/ }).fill("studio.co");
  await form
    .getByLabel("What are you building?")
    .fill("I need a storefront.\nWith a blog & a shop.");
  await form.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("heading", { name: "Message sent." })).toBeFocused();
  await expect(page.locator("[data-contact-sent]")).toContainText("sam@studio.co");

  const { count, last } = await lastEmail();
  expect(count).toBe(1);
  expect(last!.authorization).toBe("Bearer test-key");
  expect(last!.payload.to).toEqual([contactDetails.email]);
  expect(last!.payload.reply_to).toBe("sam@studio.co");
  expect(last!.payload.subject).toBe("New project enquiry from Sam <b>Rivera</b>");
  expect(last!.payload.text).toContain("About: Project: Online store");
  expect(last!.payload.text).toContain("Budget: $3,000 – $10,000");
  // The visitor's text is escaped in the HTML body and intact in the plain-text one.
  expect(last!.payload.html).toContain("Sam &lt;b&gt;Rivera&lt;/b&gt;");
  expect(last!.payload.html).not.toContain("<b>Rivera</b>");
  expect(last!.payload.html).toContain("I need a storefront.");
  expect(last!.payload.html).toContain("mailto:sam@studio.co");
  expect(last!.payload.text).toContain("With a blog & a shop.");
  expect(last!.payload.text).toContain("Website: studio.co");
  expect(last!.payload.text).toContain("Phone: +20 111 000 0000");
});

test("when delivery is rejected the visitor is told, keeps their text and gets the address", async ({
  page,
}) => {
  const form = await open(page);
  await form.getByText("Something else").click();
  await form.getByLabel("Email").fill("kim@studio.co");
  await form.getByLabel("Your message").fill("FAIL_DELIVERY please");
  await form.getByRole("button", { name: "Send message" }).click();
  const alert = page.locator("[data-contact-failure]");
  await expect(alert).toContainText("your message was not sent");
  await expect(alert.getByRole("link", { name: contactDetails.email! })).toHaveAttribute(
    "href",
    `mailto:${contactDetails.email}`,
  );
  await expect(page.getByText("Message sent.")).toHaveCount(0);
  await expect(form.getByLabel("Your message")).toHaveValue("FAIL_DELIVERY please");
  await expect(form.getByRole("button", { name: "Send message" })).toBeEnabled();
});

test("a filled honeypot gets a quiet success and no email", async ({ request }) => {
  const response = await request.post("/api/contact", {
    data: {
      topic: "other",
      email: "bot@spam.test",
      message: "Buy things now, please.",
      fax: "555-0100",
    },
  });
  expect(response.status()).toBe(200);
  expect((await lastEmail()).count).toBe(0);
});

test("a post from another origin is refused", async ({ request }) => {
  const response = await request.post("/api/contact", {
    headers: { origin: "https://evil.example" },
    data: { topic: "other", email: "a@b.co", message: "Hello there, friend." },
  });
  expect(response.status()).toBe(403);
  expect((await lastEmail()).count).toBe(0);
});

test("the form is fully keyboard operable", async ({ page }) => {
  const form = await open(page);
  // The topic is one radio group: arrow keys choose, Tab moves on.
  await form.getByLabel("A project").focus();
  await page.keyboard.press("ArrowRight");
  await expect(form.getByLabel("A job opportunity")).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel(/Name/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel("Email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel(/Company/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel(/Role/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel(/Phone or WhatsApp/)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByRole("textbox", { name: /Website/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(form.getByLabel("Tell me about the role")).toBeFocused();
  // The honeypot is skipped entirely.
  await page.keyboard.press("Tab");
  await expect(form.getByRole("button", { name: "Send message" })).toBeFocused();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the form is replaced by the email address", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-contact-form]")).toBeHidden();
    await expect(page.locator("#contact noscript p")).toBeVisible();
    await expect(page.locator("#contact noscript a")).toHaveAttribute(
      "href",
      `mailto:${contactDetails.email}`,
    );
  });
});

for (const width of [320, 390, 1440])
  test(`the contact section fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?hero=fallback");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
