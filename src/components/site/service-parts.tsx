import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { servicesPage } from "@/content/site/services";

/** An underlined link with a lime marker that sweeps in behind it on hover. */
export const underlined = "lime-sweep rounded-sm border-b border-current pb-px font-semibold";

/** The size of a section title on the services pages (34 to 54px). */
export const sectionTitle =
  "text-[clamp(2.25rem,1.1rem+3.6vw,5.5rem)] leading-[1] font-light tracking-[-0.035em] text-balance text-foreground";

/** A band of the page: a rule above it and room around it. */
export const band = "border-b border-border py-[clamp(4rem,8vw,7rem)]";

/** The work that shows a service, as links to its case studies. */
export function ServiceProof({
  seen,
  label = servicesPage.proofLabel,
}: {
  seen: readonly { label: string; href: string }[];
  label?: string;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-[1.1em] gap-y-[0.4em] text-small">
      <span className="text-muted">{label}</span>
      {seen.map((work) => (
        <Link key={work.href} href={work.href} className={underlined}>
          {work.label}
        </Link>
      ))}
    </p>
  );
}

/** "How a project runs": the numbered steps beside their title, the rule drawing in above them. */
export function ServiceProcess({ id }: { id: string }) {
  const { how } = servicesPage;
  return (
    <section aria-labelledby={`${id}-how`} className={band}>
      <Container>
        <div className="grid gap-x-[clamp(2rem,4vw,5rem)] gap-y-8 lg:grid-cols-12">
          <h2 id={`${id}-how`} className={`${sectionTitle} lg:col-span-5`}>
            <SplitWords text={how.title} />
          </h2>
          <ol data-reveal="ledger" className="m-0 list-none p-0 lg:col-span-7">
            {how.steps.map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-border py-5"
              >
                <span className="pt-[0.35em] text-small text-muted tabular-nums">{index + 1}</span>
                <p className="m-0 max-w-[52ch] text-body text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** Questions asked first: the question in bold, the answer under it, one rule between each. */
export function ServiceFaq({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <section aria-labelledby={`${id}-faq`} className={band}>
      <Container>
        <div className="grid gap-x-[clamp(2rem,4vw,5rem)] gap-y-8 lg:grid-cols-12">
          <h2 id={`${id}-faq`} className={`${sectionTitle} lg:col-span-5`}>
            <SplitWords text={title} />
          </h2>
          <dl data-reveal="ledger" className="m-0 lg:col-span-7">
            {items.map((item) => (
              <div key={item.question} className="border-b border-border py-6">
                <dt className="text-body font-semibold text-foreground">{item.question}</dt>
                <dd className="m-0 mt-2 max-w-[62ch] text-body text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

/** The closing band, in our lime: what to send, and the way to send it. */
export function ServiceClose({ id }: { id: string }) {
  const { close, askLabel } = servicesPage;
  return (
    <section
      aria-labelledby={`${id}-close`}
      data-surface="lime"
      className="bg-highlight py-[clamp(4.5rem,9vw,8rem)] text-foreground"
    >
      <Container>
        <div className="flex flex-col items-start gap-6">
          <h2 id={`${id}-close`} className={sectionTitle}>
            <SplitWords text={close.title} />
          </h2>
          <p data-reveal="fade" data-reveal-delay="0.2" className="max-w-[46ch] text-lead">
            {close.line}
          </p>
          <div data-reveal="fade" data-reveal-delay="0.2">
            <ButtonLink href="/#contact">{askLabel}</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
