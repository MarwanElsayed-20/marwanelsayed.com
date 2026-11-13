import { expect, it } from "vitest";
import { sectionRedirects } from "./redirects";
it("has permanent one-hop rules: corrected slugs first, then the exact current roots", () => {
  expect(sectionRedirects).toEqual([
    {
      source: "/saas-dashboards/wajhni",
      destination: "/saas-dashboards/wajihni",
      permanent: true,
    },
    {
      source: "/digital-products/wajhni",
      destination: "/saas-dashboards/wajihni",
      permanent: true,
    },
    { source: "/websites-ecommerce", destination: "/work", permanent: true },
    { source: "/digital-experiences", destination: "/work", permanent: true },
    {
      source: "/digital-experiences/:path*",
      destination: "/websites-ecommerce/:path*",
      permanent: true,
    },
    { source: "/saas-dashboards", destination: "/work", permanent: true },
    { source: "/digital-products", destination: "/work", permanent: true },
    { source: "/digital-products/:path*", destination: "/saas-dashboards/:path*", permanent: true },
  ]);
  for (const rule of sectionRedirects)
    expect(sectionRedirects.map((r) => r.source)).not.toContain(rule.destination);
  // Only corrected slugs redirect inside the current sections; live project pages never do.
  expect(
    sectionRedirects
      .filter(
        (r) =>
          r.source.startsWith("/websites-ecommerce/") || r.source.startsWith("/saas-dashboards/"),
      )
      .map((r) => r.source),
  ).toEqual(["/saas-dashboards/wajhni"]);
});
