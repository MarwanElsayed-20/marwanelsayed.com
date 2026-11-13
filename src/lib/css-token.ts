/**
 * Reads a color token (for example "--color-accent") from the document at runtime, so 3D code
 * never contains color literals. Falls back to a named color if the token is missing.
 */
export function readColorToken(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "black";
}
