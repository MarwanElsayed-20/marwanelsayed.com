import type { CSSProperties } from "react";
import type { ServiceId } from "@/content/site/services";
import type { ResolvedService } from "@/lib/projects/services";
import { sceneRatio, ServiceIllustration } from "./services-illustrations";

/** Where a service's illustration lies on the plate: left and width in percent of the plate's width, top in percent of its height. */
type Spot = { left: number; top: number; width: number; z: number };

const layout: Record<ServiceId, Spot> = {
  dashboards: { left: 5, top: 9, width: 42, z: 1 },
  websites: { left: 53, top: 7, width: 42, z: 1 },
  "online-stores": { left: 11, top: 55, width: 20, z: 2 },
  "saas-erp": { left: 48, top: 56, width: 31, z: 2 },
};

/** The plate's thin frame: fades in over 0.2s and tightens over 0.26s. */
const frame =
  "pointer-events-none absolute opacity-0 [transition:opacity_0.2s_ease,inset_0.26s_var(--set-ease)] group-hover:opacity-100 group-focus-visible:opacity-100";

/**
 * The decorative artwork above the list (hidden from assistive technology, like the Selected work
 * artwork; the list's own text and links carry the information): the site's dark panel and slow
 * light with one generated illustration per service laid out on it, each numbered like its row and
 * linking to that service's page (out of the tab order).
 */
export function ServicesPlate({ services }: { services: readonly ResolvedService[] }) {
  return (
    <div
      aria-hidden="true"
      data-services-plate
      data-reveal="print"
      data-print-frame
      data-surface="dark"
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-foreground [container-type:inline-size]"
    >
      <span data-silk />
      {services.map((service, index) => {
        const spot = layout[service.id];
        return (
          <a
            key={service.id}
            href={service.href}
            tabIndex={-1}
            data-plate-piece={service.id}
            className="group absolute block"
            style={
              {
                left: `${spot.left}%`,
                top: `${spot.top}%`,
                width: `${spot.width}%`,
                zIndex: spot.z,
                aspectRatio: sceneRatio(service.id),
                "--print-step": `${(0.18 + index * 0.09).toFixed(2)}s`,
              } as CSSProperties
            }
          >
            <span
              data-print-frame
              className="relative block overflow-hidden rounded-[1cqw] shadow-[0_2.2cqw_4.4cqw_-1.4cqw_color-mix(in_srgb,var(--color-foreground)_90%,transparent)] ring-1 ring-surface/15 [--print-open:-5cqw]"
            >
              <ServiceIllustration id={service.id} />
            </span>
            <span
              className={`${frame} -inset-[0.9cqw] rounded-[1.4cqw] border border-highlight group-hover:-inset-[0.55cqw]`}
            />
            <span
              data-plate-number
              className="absolute -top-[1cqw] -left-[1cqw] z-10 rounded-full bg-foreground px-[0.9cqw] py-[0.55cqw] text-[max(0.65rem,1.2cqw)] leading-none font-semibold tracking-[0.12em] text-highlight tabular-nums ring-1 ring-highlight/40"
            >
              {service.number}
            </span>
          </a>
        );
      })}
      <div data-panel-sheen aria-hidden="true" />
    </div>
  );
}

/** A row's small tile: a 4:3 detail of the service's illustration in a thin frame on the band. */
export function ServiceTile({ service }: { service: ResolvedService }) {
  return (
    <a
      href={service.href}
      tabIndex={-1}
      aria-hidden="true"
      data-service-tile={service.id}
      data-reveal="print"
      className="relative block aspect-[4/3] w-[max(13.75rem,64%)] max-w-full"
    >
      <span
        data-print-frame
        className="absolute inset-0 block rounded-[0.35rem] border border-foreground/30 bg-surface-subtle"
      >
        <span
          data-print-lift
          className="absolute inset-0 block overflow-hidden rounded-[0.35rem] border border-foreground/20 bg-surface"
        >
          <ServiceIllustration id={service.id} tile />
        </span>
      </span>
      <span data-print-marks aria-hidden="true" />
    </a>
  );
}

/**
 * A service's large picture on its page: the site's dark panel and slow light with the service's
 * illustration laid on it as one print (the artwork here is generated,
 * as in the home section). "wide" is 16:10 (beside a service's text), "card" is 4:3
 * (a page's cover); `detail` shows the 4:3 detail of the scene the list's tiles show instead of the
 * whole scene. Decoration only, so it is hidden from assistive technology.
 */
export function ServiceStage({
  id,
  shape = "wide",
  detail = false,
}: {
  id: ServiceId;
  shape?: "wide" | "card";
  detail?: boolean;
}) {
  const ratio = detail ? 4 / 3 : sceneRatio(id);
  // The panel is 100cqw wide and 100cqw / aspect tall; the picture takes at most 60% of the width
  // and 84% of the height, whatever the scene's shape.
  const aspect = shape === "wide" ? 16 / 10 : 4 / 3;
  const widest = Math.min(60, (84 / aspect) * ratio);
  return (
    <div
      aria-hidden="true"
      data-service-stage={id}
      data-stage-shape={shape}
      data-reveal="print"
      data-print-frame
      data-surface="dark"
      className={`relative grid w-full place-items-center overflow-hidden rounded-xl bg-foreground [container-type:inline-size] ${shape === "wide" ? "aspect-[16/10]" : "aspect-[4/3]"}`}
    >
      <span data-silk />
      <span
        data-print-frame
        className="relative block overflow-hidden rounded-[1cqw] shadow-[0_2.2cqw_4.4cqw_-1.4cqw_color-mix(in_srgb,var(--color-foreground)_90%,transparent)] ring-1 ring-surface/15 [--print-open:-5cqw]"
        style={
          {
            width: `${widest.toFixed(1)}cqw`,
            aspectRatio: ratio,
            "--print-step": "0.18s",
          } as CSSProperties
        }
      >
        <ServiceIllustration id={id} tile={detail} />
      </span>
      <div data-panel-sheen aria-hidden="true" />
    </div>
  );
}

/** A small 4:3 detail of a service's scene, in a thin frame: the thumbnail of a link to its page. */
export function ServiceThumb({ id }: { id: ServiceId }) {
  return (
    <span
      aria-hidden="true"
      data-service-thumb={id}
      className="block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[0.3rem] border border-foreground/20 bg-surface"
    >
      <ServiceIllustration id={id} tile />
    </span>
  );
}
