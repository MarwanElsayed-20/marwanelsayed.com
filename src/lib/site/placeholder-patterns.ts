export type PlaceholderPattern = {
  readonly id: string;
  readonly pattern: RegExp;
};

/**
 * Text that looks like leftover placeholder copy. Used by the pre-launch check and its tests.
 * Patterns carry no global flag so `test()` is stateless. Extend the list here only.
 */
export const PLACEHOLDER_PATTERNS: readonly PlaceholderPattern[] = [
  { id: "lorem-ipsum", pattern: /lorem ipsum/i },
  { id: "placeholder-word", pattern: /placeholder/i },
  { id: "tbd", pattern: /\bTBD\b/i },
  { id: "todo-fixme", pattern: /\b(?:TODO|FIXME)\b/i },
  { id: "coming-soon", pattern: /coming soon/i },
  { id: "to-be-added", pattern: /\bto be (?:added|written|announced|decided)\b/i },
  { id: "later-phases", pattern: /\blater phases?\b/i },
  { id: "template-text", pattern: /\byour (?:name|email|text|bio|title) here\b/i },
  { id: "bracketed-template", pattern: /\[(?:your|insert|add|name|email|text)[^\]]*\]/i },
  { id: "example-domain", pattern: /\bexample\.(?:com|org|net)\b/i },
  {
    id: "reserved-host",
    pattern: /(?:@|https?:\/\/)[^\s/@]*\.(?:example|invalid|test|localhost)\b/i,
  },
];

/** Returns the id of the first matching pattern, or `null` when the text looks like real copy. */
export function findPlaceholder(text: string): string | null {
  for (const { id, pattern } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(text)) return id;
  }
  return null;
}
