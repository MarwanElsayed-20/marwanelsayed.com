import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { servicePageLabels, servicesPage } from "@/content/site/services";
import type { ResolvedService } from "@/lib/projects/services";
import {
  band,
  sectionTitle,
  ServiceClose,
  ServiceFaq,
  ServiceProcess,
  ServiceProof,
  underlined,
} from "./service-parts";
import { ServiceStage, ServiceThumb } from "./services-art";

type ServiceDetailPageProps = {
  service: ResolvedService;
  /** The other services, in their order. */
  others: readonly ResolvedService[];
};

/**
 * One service's page (`/services/<id>`): a crumb, the title, the answer
 * and the way to get in touch beside a cover, what you get beside a second picture, how a project
 * runs, the first questions, the other services and the closing band. Only the service's own copy
 * and the project records are used; there is no comparison with other ways to build (nothing in
 * the records supports one).
 */
export function ServiceDetailPage({ service, others }: ServiceDetailPageProps) {
  const id = service.id;
  return (
    <>
      <section
        aria-labelledby={`${id}-title`}
        className="pt-[clamp(2.5rem,7vw,8rem)] pb-[clamp(3rem,6vw,6rem)]"
      >
        <Container>
          <header className="grid items-end gap-x-[clamp(2rem,4vw,5rem)] gap-y-10 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-7">
              <p data-reveal="fade" className="text-label tracking-widest text-muted uppercase">
                <Link href="/services" className="lime-sweep rounded-sm">
                  {servicePageLabels.crumb}
                </Link>
              </p>
              <h1
                id={`${id}-title`}
                className="text-[clamp(2.25rem,1rem+4.4vw,6.25rem)] leading-[0.97] font-light tracking-[-0.04em] text-balance text-foreground"
              >
                <SplitWords text={service.page.title} />
              </h1>
              <p
                data-reveal="fade"
                data-reveal-delay="0.2"
                className="max-w-[58ch] text-lead text-muted"
              >
                {service.page.answer}
              </p>
              <div
                data-reveal="fade"
                data-reveal-delay="0.2"
                className="flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <ButtonLink href="/#contact">{servicesPage.askLabel}</ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5">
              <ServiceStage id={id} shape="card" />
            </div>
          </header>
        </Container>
      </section>

      <section aria-labelledby={`${id}-included`} className={band}>
        <Container>
          <div className="grid items-start gap-x-[clamp(2rem,4vw,5rem)] gap-y-8 lg:grid-cols-12">
            <div className="order-first lg:sticky lg:top-8 lg:order-last lg:col-span-7">
              <ServiceStage id={id} detail />
            </div>
            <div className="flex flex-col items-start lg:col-span-5">
              <h2 id={`${id}-included`} className={sectionTitle}>
                <SplitWords text={servicePageLabels.included} />
              </h2>
              <p className="mt-5 text-body font-semibold text-foreground">{service.audience}</p>
              <ul data-reveal="ledger" className="m-0 mt-6 w-full list-none p-0">
                {service.page.points.map((point) => (
                  <li
                    key={point}
                    className="border-b border-border py-3 text-body leading-[1.55] text-foreground"
                  >
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ServiceProof seen={service.seen} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ServiceProcess id={id} />
      <ServiceFaq id={id} title={servicesPage.faq.title} items={service.page.faq} />

      <nav aria-labelledby={`${id}-other`} className={band}>
        <Container>
          <div className="grid gap-x-[clamp(2rem,4vw,5rem)] gap-y-8">
            <h2
              id={`${id}-other`}
              className="text-[clamp(1.75rem,1.2rem+1.6vw,3rem)] leading-[1.05] font-light tracking-[-0.03em] text-foreground"
            >
              {servicePageLabels.otherTitle}
            </h2>
            <ul
              data-reveal="fade"
              className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))] gap-5 p-0"
            >
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={other.href}
                    className="group grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 rounded-md border border-border p-3 text-[clamp(1.0625rem,0.95rem+0.4vw,1.375rem)] leading-[1.2] text-foreground transition-colors duration-(--duration-base) ease-standard hover:border-foreground focus-visible:border-foreground"
                  >
                    <ServiceThumb id={other.id} />
                    <span data-sweep-group className="lime-sweep w-fit rounded-sm">
                      {other.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/services" className={`${underlined} w-fit text-small`}>
              {servicePageLabels.otherAll}
            </Link>
          </div>
        </Container>
      </nav>

      <ServiceClose id={id} />
    </>
  );
}
