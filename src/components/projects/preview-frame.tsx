import Image from "next/image";
import { isSampleImageSrc } from "@/lib/projects/sample";
import type { ProjectImage } from "@/lib/projects/types";

export function PreviewFrame({
  image,
  title,
  priority = false,
  aspect = "default",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  reveal = false,
}: {
  image?: ProjectImage;
  title: string;
  priority?: boolean;
  aspect?: "default" | "native";
  sizes?: string;
  /** Marks the capture area so a "clip" reveal can settle it from a slight zoom. */
  reveal?: boolean;
}) {
  return (
    <div
      data-preview-frame
      className="overflow-hidden rounded-md border border-border bg-surface-subtle shadow-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-1 motion-safe:group-focus-visible:-translate-y-1"
    >
      <div aria-hidden="true" className="flex gap-1.5 border-b border-border px-4 py-3">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 rounded-full bg-border-strong" />
        ))}
      </div>
      <div
        data-reveal-inner={reveal ? "" : undefined}
        className={
          aspect === "native" && image ? "overflow-hidden" : "aspect-[16/10] overflow-hidden"
        }
        style={
          aspect === "native" && image
            ? { aspectRatio: `${image.width} / ${image.height}` }
            : undefined
        }
      >
        {image ? (
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.decorative ? "" : (image.alt ?? "")}
            sizes={sizes}
            unoptimized={isSampleImageSrc(image.src)}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={
              aspect === "native"
                ? "h-full w-full object-contain object-top"
                : "h-full w-full object-cover object-top"
            }
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center font-serif text-display text-muted"
          >
            {Array.from(title.trim())[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
