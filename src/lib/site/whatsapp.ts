/** The address that opens a WhatsApp chat with a number: digits only, country code first. */
export function whatsappUrl(number: string): string {
  return `https://wa.me/${number}`;
}

/** Digits only, country code first, no plus sign or spaces; 8 to 15 digits (the E.164 limit). */
export function isValidWhatsappNumber(value: string): boolean {
  return /^[1-9]\d{7,14}$/.test(value);
}

/** The label every WhatsApp link carries. */
export const whatsappLabel = "WhatsApp";
