import type { AboutContent } from "./types";

/**
 * The About paragraphs, drawn from the CV. The years of experience need updating yearly.
 * Each list holds plain-text paragraphs.
 */
export const aboutContent: AboutContent = {
  // Employers and month ranges as in the CV (public/cv). They are named
  // here, on the About page only; Work, Services and the case studies still name none.
  experience: [
    {
      place: "Webelocity",
      role: "Front-end developer",
      period: "Feb 2025 – present",
      detail:
        "Full time, remote, for a company in Canada. Front end of ToolSwift, a headless e-commerce SaaS platform: storefronts, B2B customer portals and the admin.",
    },
    {
      place: "FiveM",
      role: "Front-end developer",
      period: "Jan 2024 – Jan 2025",
      detail:
        "Full time, on site in Egypt. Led front-end development of Smooth ERP, a multi-company ERP platform for point of sale, inventory and accounting.",
    },
    {
      place: "Freelance (Upwork)",
      role: "Front-end developer",
      period: "Oct 2023 – present",
      detail: "Client projects: websites, landing pages and dashboards.",
    },
    {
      place: "Route Academy",
      role: "Full-stack web development diploma",
      period: "May 2023 – Jan 2024",
      detail:
        "Before it: Professional Front-End Development and Advanced Full-Stack Development with Egypt FWD (Udacity), 2021–2022.",
    },
  ],
  introduction: [
    "I am a front-end engineer with 3+ years of professional experience building scalable SaaS and multi-tenant web applications with React, Next.js and TypeScript.",
    "My work spans two areas: websites and e-commerce, such as storefronts and landing pages, and SaaS and dashboards, such as ERP and admin interfaces.",
  ],
  approach: [
    "I build reusable component systems so projects stay consistent and quick to extend, and I care about performance: lazy loading, parallel data fetching and careful caching in data-heavy interfaces.",
  ],
  background: [
    "I currently work remotely as a front-end developer at Webelocity, building the interfaces for ToolSwift, a headless e-commerce platform. Before that I led front-end development of Smooth ERP at FiveM in Egypt, and I have taken on freelance client projects since 2023. I completed a full-stack web development diploma at Route Academy.",
  ],
};

/**
 * The words of the About page's own layout, beside `aboutContent` (the owner's paragraphs and the
 * roles). Each line restates something already approved above or recorded in the project records:
 * no client, number or promise (employers are named only in the roles and the current-work line). The work it links to is listed by
 * project slug and resolved against the records at build time.
 */
export const aboutPage = {
  portrait: {
    src: "/about/marwan-elsayed.webp",
    width: 1200,
    height: 1200,
    alt: "Marwan Elsayed smiling, seated at a table in a café",
  },
  actions: { work: "See the work", touch: "Get in touch" },
  current: {
    label: "Current work",
    title: "Front-end engineering for a headless e-commerce platform.",
    body: "I work remotely at Webelocity, building the interfaces of ToolSwift, its headless e-commerce platform. The three projects below come from that work.",
    seenLabel: "Work from it",
    seen: ["toolswift-customer-dashboard", "toolswift-admin-platform", "toolswift-marketing"],
  },
  areas: { label: "Areas of work", title: "Two areas of work." },
  approach: {
    label: "Approach",
    title: "Reusable components and careful performance.",
    toolsLabel: "Tools in use",
    toolsNote: "Counted from the projects in the Work index.",
    /** Services rather than engineering tools; EmailJS also suggested forms without a backend. */
    toolsLeftOut: ["EmailJS"],
  },
  experience: { label: "Experience", title: "Roles and study." },
  profiles: {
    label: "Profiles",
    title: "Profiles and email.",
    body: "Write to me by email, or find me on these profiles.",
    emailLabel: "Email",
  },
} as const;
