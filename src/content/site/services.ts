export type ServiceId = "online-stores" | "websites" | "dashboards" | "saas-erp";

export type Service = {
  /** Also the address of its page, `/services/<id>`. */
  id: ServiceId;
  name: string;
  /** Who it is for: the bold line. */
  audience: string;
  includes: string;
  /** Case studies that show the work, by project slug. */
  seen: readonly { label: string; project: string }[];
  /** The service page: its title, the answer under it, what you get, and the questions asked first. */
  page: {
    title: string;
    /** The search description of the page. */
    description: string;
    answer: string;
    points: readonly string[];
    faq: readonly { question: string; answer: string }[];
  };
};

/**
 * "What I can build for you": four services in this order. Every claim
 * comes from the project records (quotes and payments from the ToolSwift customer portal,
 * real-time chat from Aligna, Arabic and English from the Smooth ERP landing pages). No prices,
 * metrics or clients beyond those records, and no claim about any other platform or business. The
 * artwork is generated per service id (`services-illustrations.tsx`), not taken from project
 * captures. The `page` of each service is the copy of its own page (`/services/<id>`), written
 * from the same records.
 */
export const servicesContent = {
  heading: "What I can build for you",
  introduction:
    "Every line below points to work you can open. For scope and timing, send a message with what you need.",
  action: { label: "Get in touch", href: "/#contact" },
  all: { label: "All services in detail", href: "/services" },
  services: [
    {
      id: "online-stores",
      name: "Online stores",
      audience: "For businesses that sell to other businesses and want a store with real accounts.",
      includes:
        "Catalogue and filters, product pages, cart, quotes, orders and payments for company buyers.",
      seen: [
        { label: "ToolSwift customer portal", project: "toolswift-customer-dashboard" },
        { label: "MDR Electrical Supply", project: "mdr-electrical-supply" },
      ],
      page: {
        title: "Online stores, from catalogue to payment",
        description:
          "Front end for online stores: catalogue and filters, product pages, cart, checkout, quotes, orders and customer accounts, shown in real work.",
        answer:
          "I build the front end of online stores: the catalogue and its filters, product pages, the cart and checkout, and the account area where customers follow their orders and quotes. It is the work behind the ToolSwift customer portal and a set of supply and retail storefronts.",
        points: [
          "Catalogue with categories, search and product selection, including variants",
          "Product pages and a cart that updates at once and recovers if a request fails",
          "Checkout and online payment, with Stripe confirmation in the ToolSwift portal",
          "Customer accounts with orders and quotes",
          "Carts and prices kept per company for buyers who work across several companies",
        ],
        faq: [
          {
            question: "Can the store take online payments?",
            answer:
              "Yes. The ToolSwift customer portal has a checkout with Stripe payment confirmation, including the return from the payment page. What a store can accept in the end depends on the payment provider account behind it.",
          },
          {
            question: "Can customers have their own accounts?",
            answer:
              "Yes. Account pages, order history and quote requests are part of the stores shown here, such as the ToolSwift portal and One Lax.",
          },
          {
            question: "Do you build the back end too?",
            answer:
              "The stores listed here were front-end work: the interface connects to the store's own API. I have built a whole product alone, from the database to the interface (Wajihni), when the project called for it.",
          },
        ],
      },
    },
    {
      id: "websites",
      name: "Websites and landing pages",
      audience: "For companies that need to be found and understood.",
      includes:
        "Fast marketing sites with product pages, articles and the forms the business uses, such as demo requests and registration.",
      seen: [
        { label: "ToolSwift marketing site", project: "toolswift-marketing" },
        { label: "Smooth ERP landing pages", project: "smooth-erp-landing-pages" },
        { label: "FalconsGT Luxury", project: "falconsgt-luxury" },
      ],
      page: {
        title: "Websites and landing pages that explain the business",
        description:
          "Marketing websites and landing pages with product pages, articles, registration and request forms, shown in real work.",
        answer:
          "I build fast marketing sites and landing pages: product pages, articles, company pages and the forms a business actually uses, such as demo requests, registration and quote requests. The ToolSwift and Smooth ERP sites and the FalconsGT vehicle sites are examples you can open.",
        points: [
          "Product pages, article reading and company pages",
          "The forms the business uses: demo requests, registration, quote requests and enquiries",
          "Multi-step flows, such as registration with code verification and an estimate questionnaire",
          "Language switching where the business serves more than one language",
          "Browsing with search, galleries and offers, as on the FalconsGT vehicle sites",
        ],
        faq: [
          {
            question: "Can people send requests from the site?",
            answer:
              "Yes. The sites shown here include demo requests (ToolSwift), registration (Smooth ERP and Hemex), quote requests (Filterco), enquiry forms (FalconsGT SML) and an estimate questionnaire (Balcon Studio).",
          },
          {
            question: "Can a site be in more than one language?",
            answer:
              "Yes. The Smooth ERP landing pages are in Arabic and English through next-intl, and the FalconsGT sites are in Arabic and English too.",
          },
          {
            question: "Can you build from an existing design?",
            answer:
              "Yes. Expat Shop was built from supplied Figma designs, as a full e-commerce front end with product, cart, checkout, account and order pages.",
          },
        ],
      },
    },
    {
      id: "dashboards",
      name: "Dashboards and admin tools",
      audience: "For teams that run their business from a screen.",
      includes:
        "Data tables with search, filters and sorting, validated forms, real-time updates, imports and exports.",
      seen: [
        { label: "ToolSwift admin platform", project: "toolswift-admin-platform" },
        { label: "Camufacturing dashboard", project: "camufacturing-dashboard" },
        { label: "Falcon translation dashboard", project: "falcon-translation-dashboard" },
      ],
      page: {
        title: "Dashboards and admin tools for teams that run on a screen",
        description:
          "Dashboards and admin tools: data tables, validated forms, live updates and bulk imports, shown in real work.",
        answer:
          "I build the interfaces teams work in all day: data tables with search, filters and sorting, validated forms, live updates and bulk imports and exports. The ToolSwift admin platform, a licence console with live import progress and an operations dashboard for a translation agency are the examples to open.",
        points: [
          "Data tables with search, sorting, pagination and export",
          "Validated forms",
          "Live updates: notifications, chat and import progress",
          "Bulk CSV import with a live progress indicator",
          "Role-specific dashboards for students, parents, instructors, sales and finance",
        ],
        faq: [
          {
            question: "Can a dashboard update while people are using it?",
            answer:
              "Yes. The licence console shows a live progress indicator while a bulk import runs, and several dashboards here use real-time notifications and chat over sockets.",
          },
          {
            question: "Can it handle large tables and bulk imports?",
            answer:
              "Yes. The Camufacturing licence grid is server-paginated with search, sorting and CSV export, and takes a bulk CSV or Excel import.",
          },
          {
            question: "Can different users see different things?",
            answer:
              "Yes. The Hemex dashboards are one family of role-specific interfaces, and Aligna and Smooth ERP show or hide screens by role and permission.",
          },
        ],
      },
    },
    {
      id: "saas-erp",
      name: "SaaS and ERP interfaces",
      audience: "For product teams building multi-tenant software with a backend and a deadline.",
      includes:
        "Role-based access, guided multi-step flows, real-time chat, Arabic and English layouts, reusable component systems.",
      seen: [
        { label: "Smooth ERP", project: "smooth-erp" },
        { label: "Aligna", project: "aligna" },
        { label: "Wajihni", project: "wajihni" },
      ],
      page: {
        title: "Interfaces for SaaS and ERP products",
        description:
          "Front end for SaaS and ERP products: role-based access, guided flows, real-time chat and reusable components, shown in real work.",
        answer:
          "I build the front end of multi-tenant software: role-based access, guided multi-step flows, real-time chat and the reusable components behind them. Smooth ERP covers point of sale, inventory and accounting, Aligna a case wizard with chat, and Wajihni a platform for students and companies.",
        points: [
          "Role and permission-based access across the whole interface",
          "Guided multi-step flows, such as a case wizard",
          "Real-time chat and notifications",
          "Arabic and English layouts",
          "Reusable components, and one codebase that serves several clients",
        ],
        faq: [
          {
            question: "Can you work on a product with several kinds of users?",
            answer:
              "Yes. Smooth ERP shows screens by permission, Aligna navigates by role, and the Hemex dashboards are a family of role-specific interfaces.",
          },
          {
            question: "Can the interface be in Arabic and English?",
            answer:
              "Yes. The Smooth ERP landing pages are in Arabic and English through next-intl, with the language selector changing the route.",
          },
          {
            question: "Do you start a product or join one that exists?",
            answer:
              "Both. I led the Smooth ERP front end, architected the ToolSwift front end, built Wajihni alone from the API to the interface, and contributed to the Hemex admin app as a front-end developer.",
          },
        ],
      },
    },
  ],
} as const satisfies {
  heading: string;
  introduction: string;
  action: { label: string; href: string };
  all: { label: string; href: string };
  services: readonly Service[];
};

/**
 * The /services page itself: the title and the lead, how a project
 * runs, and the closing line. The steps say how to work with me, no more: no price, timing or
 * guarantee appears (those are agreed by message).
 */
export const servicesPage = {
  label: "Services",
  title: "Stores, websites, dashboards and product interfaces.",
  description:
    "Online stores, websites and landing pages, dashboards and admin tools, and SaaS and ERP interfaces: four kinds of front-end work, each with case studies to open.",
  introduction:
    "Four kinds of work I take on, each with case studies you can open before deciding anything. For scope and timing, the fastest way to an answer is a short message.",
  jumpLabel: "On this page",
  detailsLabel: "Full details",
  askLabel: "Get in touch",
  proofLabel: "Seen in",
  how: {
    title: "How a project runs",
    steps: [
      "Send a message with what you need, and any link, design or example that helps. I reply by email.",
      "We settle what is included and how you will review the work, before it starts.",
      "I build it in steps you can see as it takes shape.",
    ],
  },
  faq: {
    title: "Questions asked first",
    items: [
      {
        question: "How do I get a price or a date?",
        answer:
          "Send a message with what you need. Scope and timing depend on the project, so they are settled in the reply rather than listed here.",
      },
      {
        question: "Can I see work like what I need?",
        answer:
          "Yes. Every service lists the case studies that show it, and each case study shows real screens with sample data and what I built.",
      },
      {
        question: "Do you take on work beyond these four?",
        answer:
          "Possibly. Send a message describing it. These are the kinds of work my case studies show, not a limit.",
      },
    ],
  },
  close: {
    title: "Tell me what you need.",
    line: "One message is enough for a first answer, by email.",
  },
  other: { title: "Other services", all: "All services" },
} as const;

/** The words a service's own page adds to the shared ones: its crumb, headings and links. */
export const servicePageLabels = {
  crumb: "Services",
  included: "What you get",
  otherTitle: "Other services",
  otherAll: "All services",
} as const;
