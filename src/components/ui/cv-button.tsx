import { buttonClasses, type ButtonVariant } from "@/components/ui/button";
import { cvDownload } from "@/content/site/cv";
import { cn } from "@/lib/cn";

/**
 * The CV download: a button that saves the PDF instead of opening it. Its name says what it is for
 * assistive technology ("CV, PDF download"); the arrow is decoration.
 */
export function CvButton({
  variant = "secondary",
  className,
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <a
      href={cvDownload.href}
      download={cvDownload.fileName}
      data-cv-download
      className={cn(buttonClasses(variant), className)}
    >
      {cvDownload.label}
      <span className="sr-only"> (PDF download)</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
      </svg>
    </a>
  );
}
