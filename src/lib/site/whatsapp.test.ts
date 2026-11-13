import { describe, expect, it } from "vitest";
import { isValidWhatsappNumber, whatsappUrl } from "./whatsapp";

describe("whatsapp", () => {
  it("builds the chat address from the digits only", () => {
    expect(whatsappUrl("201114766628")).toBe("https://wa.me/201114766628");
  });

  it("accepts a number with its country code and rejects anything else", () => {
    expect(isValidWhatsappNumber("201114766628")).toBe(true);
    for (const bad of ["+201114766628", "01114766628 ", "0111 476 6628", "12345", "", "abc"])
      expect(isValidWhatsappNumber(bad), bad).toBe(false);
  });
});
