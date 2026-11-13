import type { LiHTMLAttributes } from "react";
import Link from "next/link";
import { PreviewFrame } from "@/components/projects/preview-frame";
import type { WorkEntry as Entry } from "@/lib/projects/work";

export function WorkEntry({
  entry,
  eager = false,
  ...props
}: { entry: Entry; eager?: boolean } & LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li {...props} data-work-entry={entry.slug} className="min-w-0">
      <article className="flex flex-col gap-4">
        <Link
          href={entry.href}
          aria-label={`View ${entry.title}`}
          className="group block rounded-md"
        >
          <PreviewFrame title={entry.title} image={entry.image} priority={eager} />
        </Link>
        {entry.disclosure ? <p className="text-small text-muted">{entry.disclosure}</p> : null}
        <div className="flex flex-col gap-3 [overflow-wrap:anywhere]">
          {entry.productLabel ? (
            <p className="text-label font-medium text-accent">{entry.productLabel}</p>
          ) : null}
          <h3 className="line-clamp-2 font-serif text-h3 text-foreground">
            <Link href={entry.href} className="lime-sweep rounded-sm">
              {entry.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-body text-muted">{entry.summary}</p>
          <p className="text-label text-muted">{entry.category}</p>
          {entry.builtWith?.length ? (
            <ul
              aria-label="Built with"
              className="flex flex-wrap gap-x-4 gap-y-1 text-small text-muted"
            >
              {entry.builtWith.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}
