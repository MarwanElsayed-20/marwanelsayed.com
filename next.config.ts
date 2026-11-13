import type { NextConfig } from "next";
import { sectionRedirects } from "./src/config/redirects";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  // The contact email resolves its colors from the design tokens at request time.
  outputFileTracingIncludes: { "/api/contact": ["./src/styles/tokens.css"] },
  // Resolve legacy URLs before slash normalization so old links always take one hop.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [...sectionRedirects, { source: "/:path+/", destination: "/:path+", permanent: true }];
  },
};

export default nextConfig;
