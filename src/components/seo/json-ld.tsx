import { serializeJsonLd } from "@/lib/structured-data";

type JsonLdProps = {
  /** Built by one of the helpers in `@/lib/structured-data`; `null` renders nothing. */
  data: Parameters<typeof serializeJsonLd>[0] | null;
};

/** Structured data for search engines. It is data, not a script that runs. */
export function JsonLd({ data }: JsonLdProps) {
  if (data === null) return null;
  return (
    <script
      type="application/ld+json"
      // The serializer escapes `<`, so the data cannot end the element early.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
