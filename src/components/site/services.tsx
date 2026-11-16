import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SplitWords } from "@/components/ui/split-words";
import { servicesContent } from "@/content/site/services";
import type { ResolvedService } from "@/lib/projects/services";
import { ServicesPlate, ServiceTile } from "./services-art";

/** An underlined link with a lime marker that sweeps in behind it on hover. */
const underlined = "lime-sweep border-b border-current pb-px font-semibold";

/**
 * "What I can build for you": the home page's services. A sticky heading and call to action beside
 * a plate of generated illustrations and a numbered list; every row names the work that shows it.
 * The plate and tiles are decoration, so the links in the text are the way into each case study.
 */
export function Services({ services }: { services: readonly ResolvedService[] }) {
  return (
    <section
      id="services"
      tabIndex={-1}
      aria-labelledby="services-heading"
      className="bg-surface-subtle py-[clamp(3rem,8vh,7rem)] focus:outline-none"
    >
      <Container className="grid items-start gap-x-10 gap-y-12 lg:grid-cols-12">
        <header className="flex flex-col items-start gap-6 lg:sticky lg:top-24 lg:col-span-4">
          <h2
            id="services-heading"
            className="text-[clamp(3rem,1.4rem+4.6vw,7.25rem)] leading-[0.95] font-light tracking-[-0.04em] text-balance text-foreground"
          >
            <SplitWords text={servicesContent.heading} />
          </h2>
          <p
            data-reveal="fade"
            data-reveal-delay="0.2"
            className="max-w-[34ch] text-lead text-muted"
          >
            {servicesContent.introduction}
          </p>
          <div data-reveal="fade" data-reveal-delay="0.2">
            <ButtonLink href={servicesContent.action.href}>
              {servicesContent.action.label}
            </ButtonLink>
          </div>
          <div data-reveal="fade" data-reveal-delay="0.2">
            <Link
              href={servicesContent.all.href}
              className="lime-sweep tap-area rounded-sm border-b border-current pb-px text-[clamp(0.8125rem,0.76rem+0.18vw,0.9375rem)] font-medium text-foreground"
            >
              {servicesContent.all.label}
            </Link>
          </div>
        </header>
        <div
          data-services-body
          className="flex w-full min-w-0 flex-col gap-[3.6cqw] [container-type:inline-size] lg:col-span-8"
        >
          <ServicesPlate services={services} />
          <ol
            data-services-list
            data-reveal="rule"
            className="m-0 w-full list-none p-0 text-[clamp(0.9rem,1.76cqw,1.4rem)]"
          >
            {services.map((service) => (
              <li
                key={service.id}
                data-service={service.id}
                data-reveal="row"
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-[3cqw] gap-y-[2cqw] border-b border-border py-[3.3cqw] lg:grid-cols-[4.8cqw_minmax(0,1fr)_minmax(0,1.35fr)]"
              >
                <span className="row-span-2 pt-[0.6em] text-[0.75em] tracking-normal text-muted tabular-nums lg:row-span-1">
                  {service.number}
                </span>
                <div data-service-name className="grid content-start gap-[2cqw]">
                  <h3 className="text-[clamp(1.5rem,3.74cqw,2.6rem)] leading-[1.08] font-normal tracking-[-0.02em] text-foreground">
                    <Link href={service.href} className="lime-sweep rounded-sm">
                      {service.name}
                    </Link>
                  </h3>
                  <ServiceTile service={service} />
                </div>
                <div className="col-start-2 lg:col-start-3 lg:row-start-1">
                  <p className="mt-[0.4em] leading-[1.45] font-semibold text-foreground">
                    {service.audience}
                  </p>
                  <p className="mt-[0.65em] leading-[1.55] text-muted">{service.includes}</p>
                  <p className="mt-[1.1em] flex flex-wrap items-baseline gap-x-[1.1em] gap-y-[0.4em] text-[0.9em]">
                    <span className="text-muted">Seen in</span>
                    {service.seen.map((work) => (
                      <Link key={work.href} href={work.href} className={`rounded-sm ${underlined}`}>
                        {work.label}
                      </Link>
                    ))}
                    <Link
                      href={service.href}
                      aria-label={`${service.name}: details`}
                      className={`ml-auto rounded-sm ${underlined}`}
                    >
                      Details
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
