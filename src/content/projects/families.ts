export type ProductFamily = {
  id: string;
  name: string;
  story?: readonly string[];
  members: readonly { slug: string; part: string }[];
};

/** Product relationships; Work labels derive from this same content. */
export const families: readonly ProductFamily[] = [
  {
    id: "toolswift",
    name: "ToolSwift",
    story: [
      "ToolSwift is a headless commerce platform with a merchant admin interface and a B2B customer portal.",
      "The admin handles catalogues, inventory, orders and quotes; the customer portal lets company buyers browse products, build carts and manage orders and payments.",
      "I built most of the customer portal, worked on the admin's quotes, products and store settings, and built the marketing site's articles and Help Center.",
    ],
    members: [
      { slug: "toolswift-customer-dashboard", part: "Customer dashboard" },
      { slug: "toolswift-admin-platform", part: "Admin platform" },
      { slug: "toolswift-marketing", part: "Marketing site" },
    ],
  },
  {
    id: "smooth-erp",
    name: "Smooth ERP",
    story: [
      "Smooth ERP brings point of sale, inventory and accounting into an organisation-based ERP interface.",
      "Its marketing pages introduce the system and let visitors choose modules for subscription registration. I led the ERP front-end development and implemented the marketing front ends.",
    ],
    members: [
      { slug: "smooth-erp", part: "ERP interface" },
      { slug: "smooth-erp-landing-pages", part: "Marketing and subscription entry" },
    ],
  },
  {
    id: "hemex",
    name: "Hemex",
    story: [
      "Hemex is a coding academy for children with a separate app for each role. The instructor dashboard covers sessions, attendance, availability and profiles; the parent portal covers students and level booking, in English and Arabic.",
      "The public site has a home page and a four-step registration for parents (email or mobile, a verification code, contact preferences and locations) in English and Arabic, ending with a summary and a link to the parent portal.",
    ],
    members: [
      { slug: "hemex-dashboards", part: "Instructor and parent dashboards" },
      { slug: "hemex-landing-page", part: "Public site and registration" },
    ],
  },
  {
    id: "camufacturing",
    name: "Camufacturing",
    story: [
      "Camufacturing Solutions makes CAM software for additive and hybrid manufacturing. Its customer dashboard manages software licenses: a license grid, create and edit forms, bulk import with live progress, notifications and users.",
      "The public website presents APlus, the Thermic simulation, training, maintenance and research, with team, partners and publications from Strapi, and its Login button leads to the dashboard. I worked on both as a front-end developer on the team.",
    ],
    members: [
      { slug: "camufacturing-dashboard", part: "License dashboard" },
      { slug: "camufacturing-site", part: "Public website" },
    ],
  },
  {
    id: "falconsgt",
    name: "FalconsGT",
    story: [
      "The FalconsGT work spans three automotive front ends: Motors, SML commercial vehicles and Luxury vehicles.",
      "Motors is a car trading and export site in Arabic, English and French, with a filterable vehicle list, vehicle pages and export enquiries. SML presents SML Isuzu trucks and buses with a model browser, comparison and campaign pages per market, while Luxury is a showroom site in English and Arabic with filters, comparison and campaign pages. My role across these sites was front-end development.",
    ],
    members: [
      { slug: "falcons-gt-motors", part: "Trading and export site" },
      { slug: "falconsgt-sml", part: "Commercial vehicles" },
      { slug: "falconsgt-luxury", part: "Luxury vehicles" },
    ],
  },
];
