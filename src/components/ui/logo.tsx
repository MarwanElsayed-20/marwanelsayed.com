import { monogramPaths } from "@/lib/brand/monogram";
import { site } from "@/config/site";

const { width, height, mark } = monogramPaths("master");

/**
 * The ME monogram, drawn from the one construction in lib/brand/monogram, in the surrounding text
 * colour (ink on paper; set `text-background` on a dark surface). It is the owner's name for
 * assistive technology, unless it is `decorative` (then it is hidden from them). Size it with a height class; the width follows.
 */
export function Logo({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": site.name })}
      fill="currentColor"
      className={className}
    >
      <path d={mark} />
    </svg>
  );
}
