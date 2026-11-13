/** Trim optional text and omit blanks before presenting it. */
export function cleaned(values?: readonly string[]): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}
