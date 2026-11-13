import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ProseProps = {
  className?: string;
  children: ReactNode;
};

/** Typography for long-form content. No plugin dependency; rules use tokens only. */
export function Prose({ className, children }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-reading text-body text-foreground [&>*+*]:mt-6 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-6 [&_blockquote]:font-serif [&_blockquote]:text-lead [&_code]:rounded-sm [&_code]:bg-surface-subtle [&_code]:px-1 [&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-h2 [&_h2]:font-medium [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-h3 [&_h3]:font-medium [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
