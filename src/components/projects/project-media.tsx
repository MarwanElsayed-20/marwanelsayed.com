import { IMAGE_KIND_LABEL } from "@/lib/illustrations/labels";
import Image from "next/image";
import { isSampleImageSrc } from "@/lib/projects/sample";
import type { BaseProject, CardImageFit } from "@/lib/projects/types";

const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";
const DETAIL_SIZES = "(min-width: 72rem) 72rem, 100vw";

function initial(title: string): string {
  const first = Array.from(title.trim())[0];
  return first ? first.toUpperCase() : "";
}

type ProjectCardMediaProps = {
  project: BaseProject;
  /** `cover` crops the image to fill the frame; `contain` shows the whole image inside it. */
  fit?: CardImageFit;
};

/** Card media: a 16:10 frame holding the image, or a lettered frame when the project has no image. */
export function ProjectCardMedia({ project, fit = "cover" }: ProjectCardMediaProps) {
  const { image } = project;
  if (!image) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-[16/10] w-full items-center justify-center rounded-sm bg-surface-subtle font-serif text-display text-muted select-none"
      >
        {initial(project.title)}
      </div>
    );
  }
  return (
    <>
      <div className="aspect-[16/10] w-full overflow-hidden rounded-sm bg-surface-subtle">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.decorative ? "" : (image.alt ?? "")}
          sizes={CARD_SIZES}
          unoptimized={isSampleImageSrc(image.src)}
          className={
            fit === "contain" ? "h-full w-full object-contain" : "h-full w-full object-cover"
          }
        />
      </div>
      {image.kind ? (
        <p className="inline-block rounded-sm bg-surface-subtle px-2 py-1 text-label font-medium uppercase [overflow-wrap:anywhere] text-muted">
          {IMAGE_KIND_LABEL[image.kind]}
        </p>
      ) : null}
    </>
  );
}

/** Detail media: the single primary image in a frame that keeps the image's own aspect ratio. */
export function ProjectDetailMedia({ project }: { project: BaseProject }) {
  const { image } = project;
  if (!image) return null;
  return (
    <figure className="flex flex-col gap-3">
      <div
        className="max-h-[80vh] w-full overflow-hidden rounded-md bg-surface-subtle"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.decorative ? "" : (image.alt ?? "")}
          sizes={DETAIL_SIZES}
          loading="eager"
          unoptimized={isSampleImageSrc(image.src)}
          className="h-full w-full object-contain"
        />
      </div>
      {image.caption ? (
        <figcaption className="text-small text-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}
