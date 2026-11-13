import { Fragment } from "react";

type SplitWordsProps = {
  text: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  step?: number;
};

/**
 * Renders text as words that rise out of their own clipped line when the page reveals. The text
 * stays real text in the DOM: selectable, searchable, and read normally by assistive technology.
 */
export function SplitWords({ text, delay = 0, step = 0.05 }: SplitWordsProps) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span data-reveal="mask" data-reveal-delay={(delay + index * step).toFixed(2)}>
            <span>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
