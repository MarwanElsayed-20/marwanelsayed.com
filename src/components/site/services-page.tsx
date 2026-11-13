import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { servicesPage } from "@/content/site/services";
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
import { ServicesPlate, ServiceStage } from "./services-art";

type ServicesPageProps = {
  services: readonly ResolvedService[];
};

/**
 * The /services page: a title and lead beside the way to get in
 * touch, the plate of artwork, a numbered list that jumps to each service, one section per service
 * (text beside a sticky picture, the picture alternating sides), how a project runs, the first
 * questions and a closing band. All of its words come from `servicesPage` and the project records.
 */
export function ServicesPage({ services }: ServicesPageProps) {
  return (
    <>
      <section aria-labelledby="services-title" className="pt-[clamp(2.5rem,7vw,8rem)]">
        <Container>
          <header className="grid gap-x-[clamp(2rem,4vw,5rem)] gap-y-8 lg:grid-cols-[7fr_5fr]">
            <h1
              id="services-title"
              className="text-[clamp(2.75rem,1.1rem+5.6vw,8rem)] leading-[0.95] font-light tracking-[-0.045em] text-balance text-foreground"
            >
              <SplitWords text={servicesPage.title} />
            </h1>
            <div className="flex flex-col items-start gap-6 lg:self-end">
              <p
                data-reveal="fade"
                data-reveal-delay="0.2"
                className="max-w-[40ch] text-lead text-muted"
              >
                {servicesPage.introduction}
              </p>
              <div
                data-reveal="fade"
                data-reveal-delay="0.2"
                className="flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                <ButtonLink href="/#contact">{servicesPage.askLabel}</ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-full">
              <div className="w-[min(100%,130svh)]">
                <ServicesPlate services={services} />
              </div>
            </div>
            <nav
              aria-label={servicesPage.jumpLabel}
              data-reveal="ledger"
              className="mt-[clamp(1rem,3vw,3rem)] grid grid-cols-2 border-b border-foreground lg:col-span-full lg:grid-cols-4"
            >
              {services.map((service) => (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className={`group grid content-start gap-1.5 border-border py-5 pe-4 text-[clamp(1.0625rem,0.9rem+0.45vw,1.5rem)] leading-[1.2] max-lg:odd:border-e lg:not-last:border-e lg:[&:not(:first-child)]:ps-4 max-lg:[&:nth-child(even)]:ps-4 max-lg:[&:nth-child(n+3)]:border-t`}
                >
                  <span aria-hidden="true" className="text-label text-muted tabular-nums">
                    {service.number}
                  </span>
                  <span data-sweep-group className="lime-sweep w-fit rounded-sm">
                    {service.name}
                  </span>
                </a>
              ))}
            </nav>
          </header>
        </Container>
      </section>

      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          data-service-section={service.id}
          tabIndex={-1}
          aria-labelledby={`${service.id}-title`}
          className={`${band} scroll-mt-6 focus:outline-none`}
        >
          <Container>
            <div className="grid items-start gap-x-[clamp(2rem,4vw,5rem)] gap-y-8 lg:grid-cols-12">
              <div
                className={`order-first lg:sticky lg:top-8 lg:col-span-7 ${index % 2 === 1 ? "lg:order-first" : "lg:order-last"}`}
              >
                <ServiceStage id={service.id} />
              </div>
              <div className="flex flex-col items-start lg:col-span-5">
                <span className="text-label text-muted tabular-nums">{service.number}</span>
                <h2 id={`${service.id}-title`} className={`${sectionTitle} mt-3`}>
                  <Link href={service.href} className="lime-sweep rounded-sm">
                    <SplitWords text={service.name} />
                  </Link>
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
                <div className="mt-6 flex flex-col items-start gap-6">
                  <ServiceProof seen={service.seen} />
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-small">
                    <Link
                      href={service.href}
                      aria-label={`${service.name}: ${servicesPage.detailsLabel.toLowerCase()}`}
                      className={underlined}
                    >
                      {servicesPage.detailsLabel}
                    </Link>
                    <Link href="/#contact" className={underlined}>
                      {servicesPage.askLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <ServiceProcess id="services" />
      <ServiceFaq id="services" title={servicesPage.faq.title} items={servicesPage.faq.items} />
      <ServiceClose id="services" />
    </>
  );
}
