import type { Project } from "@/lib/projects/types";

/**
 * Production projects: websites and online stores.
 * Every image is a capture of the project's own interface rendered with sample data.
 * Case-study text states only what the code or the CV supports; unrecorded roles, dates, results
 * and links are marked as not recorded or omitted.
 */
export const digitalExperiencesProjects: readonly Project[] = [
  {
    slug: "mdr-electrical-supply",
    scope:
      "Built the wholesale storefront around the shared shop: CMS home sections, password-protected catalogues with a request flow, the shop mega menu, support, about and contact pages, and the Strapi CMS.",
    features: [
      {
        title: "Catalogues and access",
        points: [
          "The Our Catalogs menu lists catalogues from the CMS, and each opens on its own page with the catalogue embedded.",
          "A protected catalogue opens a modal: request a password through a short form, or enter one to open it for the rest of the visit.",
          "Embed code from the CMS is cleaned to allow only iframes with listed attributes, and a loading state shows until the embed loads.",
        ],
      },
      {
        title: "Home page and navigation",
        points: [
          "A hero with rotating background images, then flyer, promotional, catalogue and sign-up banners from the CMS, each with its own loading skeleton.",
          "A shop mega menu: hovering a category shows its subcategories, with a link to shop all.",
          "Header and footer category links come from the shop API.",
        ],
      },
      {
        title: "Company pages",
        points: [
          "A support page with tabs for the privacy, terms, returns and shipping policies, each reachable by its own link.",
          "About (story, where the business is today, what it carries) and a contact page with FAQs and a contact form sent through EmailJS.",
        ],
      },
    ],
    decisions: [
      {
        title: "Catalogue access for one visit",
        detail:
          "Opening a protected catalogue is remembered per catalogue in session storage and announced with a browser event, so the menu and the page agree. The password is compared in the browser: it keeps casual visitors out rather than securing the file.",
      },
      {
        title: "CMS content refreshed on publish",
        detail:
          "Strapi requests carry cache tags and are kept for an hour; a webhook route expires the matching tags when content is published or changed, so banner and catalogue edits appear without a deploy.",
      },
      {
        title: "Search engines see the whole catalogue",
        detail:
          "Product pages add structured product data, and the sitemap is split into categories and paged product lists, with generated share images for the site.",
      },
    ],
    title: "MDR Electrical Supply",
    category: "e-commerce",
    summary:
      "A wholesale electrical-supply storefront with CMS-managed home banners, password-protected catalogues and a shop mega menu.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "TanStack Query",
      "Strapi",
      "DOMPurify",
      "EmailJS",
    ],
    period: "2026",
    progress: "completed",
    image: {
      src: "/projects/mdr-electrical-supply/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the MDR Electrical Supply home page: the header, the hero for hardware stores and the CMS banners.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/mdr-electrical-supply/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the MDR Electrical Supply home page: the header with the catalogue menu and the hero for hardware stores and building supplies.",
        caption: "Home page.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/02-home-banners.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the home page promotional banners from the CMS above the category circles.",
        caption: "Home page banners and categories.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/03-catalogs-menu.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Our Catalogs menu open over the home page, listing three catalogues from the CMS.",
        caption: "Catalogue menu.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/04-catalog-access.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Dealer Price Book modal with two choices: request access or enter a password.",
        caption: "Protected catalogue.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/05-catalog-request.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Request Passcode form filled in: name, phone, email, city and a message.",
        caption: "Catalogue password request.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/06-catalog.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Electrical Catalog page with a sample catalogue embedded below the title.",
        caption: "Catalogue page.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/07-shop-menu.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the shop mega menu: categories on the left and the Circuit Protection subcategories beside them.",
        caption: "Shop menu.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/08-support.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the support page on the Returns Policy tab, with links to the other policies at the side.",
        caption: "Support page.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/09-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the about page: the Our Story and Where We Are Today sections with photos.",
        caption: "About page.",
      },
      {
        src: "/projects/mdr-electrical-supply/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the home page on a phone: the category grid and the monthly flyer banner.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "A storefront for a wholesale electrical, plumbing and hardware supplier that serves hardware stores, built on the ToolSwift commerce platform: the shop pages come from the platform's shared storefront library.",
      "Around the shop, the site has a home page edited in the CMS, catalogues, about, support and contact pages.",
    ],
    role: [
      "Front-end developer: built the storefront from June to September 2026, and its Strapi CMS (global settings with the catalogue menu and opening hours, the home page, and dashboard banners).",
    ],
    approach: [
      "Next.js 16 with React 19 and TypeScript, MUI and Tailwind CSS 4 around the shared storefront library.",
      "Home sections and global settings are read from Strapi on the server; forms send through a server route to EmailJS so the private key stays on the server.",
    ],
  },
  {
    slug: "rd-electrical-supply",
    scope:
      "Built the electrical and lighting storefront around the shared shop: a CMS-edited hero, brands, a resources hub with guides, contact, about and support pages, and the Strapi CMS behind them.",
    features: [
      {
        title: "Resources hub",
        points: [
          "Guides are written in the CMS and listed on a resources page; each opens on its own page of titled sections with rich text and pictures.",
          "Unknown guide addresses show the not-found page, and each guide page carries its own metadata and structured data.",
        ],
      },
      {
        title: "Home, brands and company pages",
        points: [
          "The home hero is edited in the CMS: title, subtitle, an optional button and the background picture.",
          "A brands page shows the logos entered in the CMS, linking out when a brand has a link.",
          "Contact with FAQs and a form sent through EmailJS, an about page, and support pages for the store's policies; opening hours come from the CMS.",
        ],
      },
      {
        title: "Shop around the shared library",
        points: [
          "A shop mega menu: hovering a category shows its subcategories, with a link to shop all.",
          "The cart drawer loads after the first pointer, scroll or keyboard interaction.",
        ],
      },
    ],
    decisions: [
      {
        title: "Payment configuration scoped to checkout",
        detail:
          "The storefront provider passes the full public configuration on the checkout route and clears payment-related entries elsewhere. This keeps those entries from reaching the shared provider on other routes.",
      },
      {
        title: "CMS content refreshed on publish",
        detail:
          "Strapi requests carry cache tags and are kept for an hour; a webhook route expires the matching tags when content is published or changed, so hero, brand and guide edits appear without a deploy.",
      },
      {
        title: "Found and shared properly",
        detail:
          "The site generates its sitemap, robots file, app manifest, icons and Open Graph and Twitter images, and product pages handle loading errors with their own error screen.",
      },
    ],
    title: "RD Electrical Supply",
    category: "e-commerce",
    summary:
      "An electrical and lighting storefront with a CMS-edited hero, brands, a resources hub of guides, shopping and checkout.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "TanStack Query",
      "Strapi",
      "EmailJS",
    ],
    period: "2026",
    progress: "completed",
    image: {
      src: "/projects/rd-electrical-supply/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the RD Supply home page: the header and the dark hero for electrical and lighting supplies.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/rd-electrical-supply/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the RD Supply home page: the header, the navigation and the hero edited in the CMS.",
        caption: "Home page.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/02-home-categories.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the home page categories with drawn product pictures, above the featured products.",
        caption: "Home page categories.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/03-shop-menu.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the shop mega menu: categories on the left and the Lighting subcategories beside them.",
        caption: "Shop menu.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/04-brands.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the brands page: the hero and the Brands We Carry grid of logos from the CMS.",
        caption: "Brands page.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/05-resources.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the resources page: the Tools, Guides & Resources hero and four guide cards from the CMS.",
        caption: "Resources hub.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/06-resource.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Choosing LED Bulbs guide: the title banner, the summary and its first section with a picture.",
        caption: "Guide page.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/07-catalogue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the catalogue: category filters, subcategories, search and product cards.",
        caption: "Catalogue.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/08-contact.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the contact page with the form filled in beside a drawn stand-in for the store map.",
        caption: "Contact page.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/09-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the about page: the brands hero and the Who We Are section.",
        caption: "About page.",
      },
      {
        src: "/projects/rd-electrical-supply/screens/10-phone-resources.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the resources page on a phone: the hero and the first guide card.",
        caption: "Resources on a phone.",
      },
    ],
    context: [
      "A storefront for an electrical and lighting store serving homeowners and trades, built on the ToolSwift commerce platform: the shop pages come from the platform's shared storefront library.",
      "Around the shop, the site has a home page, brands, resources with guides, about, support and contact pages.",
    ],
    role: [
      "Front-end developer: built the storefront in June and July 2026, and its Strapi CMS (home page, global settings, brands and resources) with a client guide.",
    ],
    approach: [
      "Next.js 16 with React 19 and TypeScript, MUI and Tailwind CSS 4 around the shared storefront library.",
      "Hero, brands, guides and opening hours are read from Strapi on the server, and guides are rendered with Strapi's blocks renderer. Forms send through a server route to EmailJS.",
    ],
  },
  {
    slug: "commissioners-pharmacy",
    scope:
      "Built the pharmacy website: services, compounding, minor-ailments and blog pages, new, refill and transfer prescription requests with file upload, the contact flow and the SEO and speed work.",
    features: [
      {
        title: "Prescription requests",
        points: [
          "Separate forms for a new prescription, a refill and a transfer; a refill takes up to four prescription numbers.",
          "The new-prescription form requires pickup or delivery, a requested date and privacy consent, and takes a photo or PDF of the prescription.",
          "The file is uploaded first and the request is emailed with its link; a failed upload stops the request with a message.",
          "After a successful request the form shows a success view for four seconds before resetting.",
        ],
      },
      {
        title: "Pharmacy service pages",
        points: [
          "A services page with tabs for blister packaging, compression stockings, flu shots and immunisation, and medication review, each with its own request button.",
          "A compounding page with the pharmacy's services, consultation steps and FAQs.",
          "A minor-ailments page with a search over the 19 conditions the pharmacists can assess, each with its symptoms.",
        ],
      },
      {
        title: "Blog",
        points: [
          "A blog of compounding and health articles with a featured post, and article pages with a recent-posts column.",
        ],
      },
    ],
    decisions: [
      {
        title: "Search results that explain the pages",
        detail:
          "Pages carry their own metadata, FAQ sections publish FAQ structured data, policy and product pages publish breadcrumb data, and the not-found page offers links back into the site instead of a dead end.",
      },
      {
        title: "Faster pages for a picture-heavy site",
        detail:
          "Large section backgrounds go through an optimised background-image component, unused packages were removed and package imports are optimised in the Next.js config, following a Lighthouse review.",
      },
    ],
    title: "Commissioners Pharmacy",
    category: "e-commerce",
    summary:
      "A pharmacy website combining online shopping, prescription requests, pharmacy services, compounding and a health blog.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "Redux Toolkit",
      "React Hook Form",
      "Joi",
      "Firebase",
      "EmailJS",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/commissioners-pharmacy/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Commissioners Pharmacy compounding page: the header and the hero for compounded medications.",
      caption: "Compounding page.",
    },
    screens: [
      {
        src: "/projects/commissioners-pharmacy/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Commissioners Pharmacy home page: the header, the compounding hero and the service highlights.",
        caption: "Home page.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/02-services.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the services page on the Blister Packaging tab, with tabs for the other services.",
        caption: "Services page.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/03-compounding.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the compounding page hero with the button to fill a compounded prescription.",
        caption: "Compounding page.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/04-minor-ailments.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the minor-ailments search and the first conditions with their symptoms.",
        caption: "Minor ailments.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/05-blog.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the blog: a featured article and a column of recent posts.",
        caption: "Blog.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/06-blog-post.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an article page with the recent-posts column beside it.",
        caption: "Article page.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/07-prescription-new.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the new-prescription form filled with invented details, a sample file attached and consent ticked.",
        caption: "New prescription request.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/08-prescription-refill.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the refill form filled with invented details and one prescription number.",
        caption: "Refill request.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/09-contact.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the contact page: address, hours, phone and fax with sample values, and the contact form.",
        caption: "Contact page.",
      },
      {
        src: "/projects/commissioners-pharmacy/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the home page on a phone: the header and the compounding hero.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "A pharmacy website that joins an online shop with pharmacy services: prescriptions, compounding, minor-ailment assessments and a blog.",
      "The shop pages come from the ToolSwift commerce platform's shared storefront library; the pharmacy pages and request forms are the site's own.",
    ],
    role: [
      "Front-end developer: built the pharmacy pages from March to April 2025 and returned in March and April 2026 to rebuild the prescription flows, update the pages and do the SEO and speed work.",
    ],
    approach: [
      "Next.js 16 with React 19 and TypeScript, styled with SCSS modules, Tailwind CSS and MUI, with Redux Toolkit for shop state.",
      "Forms use React Hook Form with Joi schemas; uploads go to Firebase Storage and requests are sent with EmailJS.",
    ],
  },
  {
    slug: "hamilton-pharmacy",
    scope:
      "Rebuilt the pharmacy's React website in Next.js: every page moved over with layout parity, one prescription page for new, refill and transfer requests, server-side reCAPTCHA checks and the speed and SEO work.",
    features: [
      {
        title: "Prescription requests on one page",
        points: [
          "New-prescription, refill and transfer forms share one page; the Prescription menu links straight to each form and the page scrolls to it.",
          "The new-prescription form takes a photo or PDF of the prescription, a date of birth, pickup or delivery with a date, and privacy consent.",
          "Choosing delivery adds address fields, with the province list loaded for the selected country.",
          "A refill takes several prescription numbers, one row at a time; a transfer asks for the previous pharmacy and the prescriptions to move.",
        ],
      },
      {
        title: "Contact and pharmacy pages",
        points: [
          "A contact form that asks for reCAPTCHA on the first send, checks it on the server, then shows whether the email went out.",
          "Services, minor-ailments, virtual travel clinic, about, policy and privacy pages split into section components.",
          "Shared loading screens in the pharmacy's colours on every route, and error screens with a retry button on the form and service pages.",
        ],
      },
    ],
    decisions: [
      {
        title: "Keep the verification secret on the server",
        detail:
          "The old site called the verification service from the browser, with its token in the client bundle. A Next.js route handler now makes that call, so the token stays on the server and the forms only learn whether the check passed.",
      },
      {
        title: "Server-rendered pages with small animated parts",
        detail:
          "Scroll animations sit in one small client component, so page content renders on the server. Each page has its own metadata and canonical link, and the hero image is loaded first with a high fetch priority to speed up the largest paint.",
      },
    ],
    title: "Hamilton Pharmacy",
    category: "e-commerce",
    summary:
      "A community pharmacy website, rebuilt in Next.js, with services, minor ailments, a virtual travel clinic and online prescription requests.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "MUI",
      "SCSS",
      "Swiper",
      "Day.js",
      "EmailJS",
      "reCAPTCHA",
      "Firebase",
    ],
    period: "2026",
    progress: "completed",
    image: {
      src: "/projects/hamilton-pharmacy/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Hamilton Pharmacy home page: the header, the hero with a photo carousel and the pharmacy's figures.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/hamilton-pharmacy/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hamilton Pharmacy home page: the header, the hero with a photo carousel and the pharmacy's figures.",
        caption: "Home page.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/02-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the about page: the welcome headline and a photo of the pharmacy, with the address replaced by a sample one.",
        caption: "About page.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/03-services.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the services page hero above a photo of a pill organiser.",
        caption: "Services page.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/04-virtual-clinic.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the virtual travel clinic page and its first section with a button to book a consultation.",
        caption: "Virtual travel clinic.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/05-minor-ailments.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the minor-ailments section: symptoms for seasonal allergies beside the list of conditions.",
        caption: "Minor ailments.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/06-prescription-new.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the new-prescription form filled with invented details, pickup chosen and consent ticked.",
        caption: "New prescription request.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/07-prescription-refill.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the refill form filled with invented details, one prescription number and a button to add another.",
        caption: "Refill request.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/08-prescription-transfer.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the transfer form filled with invented details and a sample previous pharmacy.",
        caption: "Transfer request.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/09-contact.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the contact form filled with invented details beside the call to reach out.",
        caption: "Contact form.",
      },
      {
        src: "/projects/hamilton-pharmacy/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the home page on a phone: the header, the hero and the pharmacy's figures.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "A community pharmacy website with service pages, minor-ailment assessments, a virtual travel clinic and online prescription requests.",
      "The first version, from November 2023, was a React site built with Vite and React Router; in 2026 it moved to Next.js.",
    ],
    role: [
      "Front-end developer: built the pharmacy's first React site, then rebuilt it in Next.js in March 2026, from the first commit to the shared error screens.",
    ],
    approach: [
      "Next.js 16 App Router with React 19 and TypeScript, MUI 7 and SCSS, with each page split into section components.",
      "Forms send through EmailJS after a server-side reCAPTCHA check; prescription files go to Firebase Storage.",
    ],
  },
  {
    slug: "lumber-cart",
    scope:
      "Built the building-supply storefront: home sections from the CMS, careers with a four-step job application, personal and corporate credit applications, pro accounts and the Strapi CMS behind them.",
    features: [
      {
        title: "Careers and job applications",
        points: [
          "Open roles come from the CMS; each has its own page with duties, requirements and an Apply Now button.",
          "The application has four steps with a progress rail: personal details, availability and eligibility, previous employers, and other experience.",
          "Each step is checked before Continue. Applicants attach a CV, sign by typing their name or uploading a signature, and confirm a certification.",
        ],
      },
      {
        title: "Credit applications",
        points: [
          "A personal credit application in five steps and a corporate one in eight, covering business, banking, invoices, trade references, a guarantee and the credit terms.",
          "Trade references can be added and removed as repeating groups.",
          "On submission the answers become a branded PDF; the applicant can download a copy and the business receives a link to it.",
        ],
      },
      {
        title: "Home page and content",
        points: [
          "Shop banners, weekly offers, top brands and the announcement bar are edited in the Strapi CMS, with content types and a client guide built for this site.",
          "A mobile app banner, a Build Now, Pay On Terms section linking both credit applications, and a contact form on the home page.",
          "Request a Quote opens a modal that sends buyers to sign up or log in to the customer dashboard, where quotes are handled.",
        ],
      },
    ],
    decisions: [
      {
        title: "CMS content cached and refreshed on publish",
        detail:
          "Strapi requests carry cache tags for the home page, careers and each job, and are kept for an hour. A webhook route expires the matching tags when an entry is published, updated or deleted, so edits appear without a deploy.",
      },
      {
        title: "Email keys kept on the server",
        detail:
          "Forms post to the site's own route, which adds the EmailJS private key on the server before sending. Uploaded CVs, signatures and credit PDFs go to Firebase Storage, and the email carries their links instead of attachments.",
      },
      {
        title: "Heavy parts load on demand",
        detail:
          "The cart drawer loads after the first pointer, scroll or key press, the store map and the banner video load when needed, and payment keys reach the shop provider only on the checkout route.",
      },
    ],
    title: "Lumber Cart",
    category: "e-commerce",
    summary:
      "A building-supply storefront with a shop, careers and job applications, credit applications and pro accounts, its content edited in Strapi.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "TanStack Query",
      "Strapi",
      "React Hook Form",
      "Zod",
      "jsPDF",
      "Firebase",
      "EmailJS",
    ],
    period: "2026",
    progress: "completed",
    image: {
      src: "/projects/lumber-cart/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Lumber Cart home page: the header, the Ready to become a Pro? banner and shop banners from the CMS.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/lumber-cart/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Lumber Cart home page: the announcement bar, the header and the Ready to become a Pro? banner above the shop banners.",
        caption: "Home page.",
      },
      {
        src: "/projects/lumber-cart/screens/02-weekly-offers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the home page weekly offers from the CMS and featured products with prices, stock and Add to cart.",
        caption: "Weekly offers and featured products.",
      },
      {
        src: "/projects/lumber-cart/screens/03-catalogue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the catalogue: All products with subcategories, search and product cards for lumber, plywood, decking and doors.",
        caption: "Catalogue.",
      },
      {
        src: "/projects/lumber-cart/screens/04-careers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the careers page: Why Work at Lumbercart and the Currently Hiring list with three open roles.",
        caption: "Careers.",
      },
      {
        src: "/projects/lumber-cart/screens/05-job-post.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Yard Associate job page: location, job type, Apply Now, and the duties and requirements lists.",
        caption: "Job page.",
      },
      {
        src: "/projects/lumber-cart/screens/06-job-application.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the job application's first step filled in: the four-step rail and the demographic information fields.",
        caption: "Job application, first step.",
      },
      {
        src: "/projects/lumber-cart/screens/07-job-application-signature.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the application's last step: completed steps ticked, experience answers, the typed signature and the certification.",
        caption: "Job application, last step.",
      },
      {
        src: "/projects/lumber-cart/screens/08-credit-application.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the corporate credit application at Trade References: four steps ticked and two references filled in.",
        caption: "Corporate credit application.",
      },
      {
        src: "/projects/lumber-cart/screens/09-quote-modal.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Enhanced Quote Experience modal: sign up and start ordering, or log in to the customer dashboard.",
        caption: "Request a Quote modal.",
      },
      {
        src: "/projects/lumber-cart/screens/10-phone-careers.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the careers page on a phone: the Currently Hiring list with full-width Apply Now buttons.",
        caption: "Careers on a phone.",
      },
    ],
    context: [
      "A storefront for a building-supply business, built on the ToolSwift commerce platform: the shop pages come from the platform's shared storefront library.",
      "Around the shop, the site has a home page edited in the CMS, about, pro account, careers and job applications, two credit applications, support pages and contact.",
    ],
    role: [
      "Front-end developer: built the storefront from April to October 2026, and its Strapi CMS (content types for the home page, jobs and dashboard banners, and a client guide).",
    ],
    approach: [
      "Next.js 16 with React 19 and TypeScript, MUI and Tailwind CSS 4 around the shared storefront library; forms use React Hook Form with Zod schemas.",
      "Pages and job posts are read from Strapi on the server. Credit PDFs are drawn with jsPDF, files are stored in Firebase and email goes through EmailJS.",
      "Every page has metadata and JSON-LD, with a sitemap, robots file and generated share images.",
    ],
  },
  {
    slug: "slack-lumber",
    scope:
      "Built the lumber yard's online store: home sections, product list and pages, search, reviews, a cart with promo codes, a Stripe checkout, a wishlist, quote requests, pro sign-up and service pages.",
    features: [
      {
        title: "Shopping",
        points: [
          "The home page opens on a product slider beside a deals panel, then featured categories, services, best sellers, deals, products by category in tabs, a sale banner and a contact form.",
          "All Products filters by category and subcategory, price and brand, and sorts; cards show sale prices, out-of-stock and added-to-cart states, and a wishlist heart.",
          "Search in the header, within one category or all, lists matching products with price and stock, and adds them to the cart or the wishlist.",
          "Product pages with a gallery, variants kept in the address, custom fields, a quantity limited by stock, bulk prices, share and wishlist buttons, and similar products.",
        ],
      },
      {
        title: "Cart and checkout",
        points: [
          "The cart page changes quantities, applies promo codes, shows the sale discount and tax, invites customers to a pro account and suggests products frequently bought together.",
          "Checkout runs in steps: account information, delivery or store pickup, a shipping method from live rates, and card payment through Stripe, then an order confirmation page.",
          "The cart and the quote list are saved in the browser; the wishlist is kept for the session.",
        ],
      },
      {
        title: "Reviews and quotes",
        points: [
          "Product reviews with a rating summary and bars, and a form with a star rating, a recommendation, a title and a message for signed-in customers.",
          "Request a Quote: products are searched into the quote list with quantities, beside contact fields and pickup or shipping with an address and a carrier.",
        ],
      },
      {
        title: "Accounts and pages",
        points: [
          "Sign-in with email or Google, personal sign-up and a two-step pro sign-up for businesses, email verification, password reset, and changing the email or password.",
          "Pages for services, Window Werx windows, lumber, the pro program and contact.",
        ],
      },
    ],
    decisions: [
      {
        title: "One server helper for store data",
        detail:
          "A server action builds each request from a named endpoint, adds the store key and, when needed, the customer's token from the NextAuth session, and tags the fetch with the endpoint's name, so a write such as a new review can refresh that data.",
      },
      {
        title: "Cart lines keyed by variant and inputs",
        detail:
          "A product goes into an existing cart line only when the variant and its custom field values match, and Add to cart is disabled when the line would go past the stock, so custom orders never merge by mistake.",
      },
      {
        title: "The basket survives a reload",
        detail:
          "A Redux middleware writes the cart and the quote list to localStorage and the wishlist to sessionStorage whenever those slices change, and the slices read them back on start.",
      },
      {
        title: "Sign-in through NextAuth",
        detail:
          "Email sign-in and Google sign-in (a Firebase token exchanged for the store's own) both run as NextAuth providers; the session carries the store token, and middleware keeps signed-in customers out of the login pages and others out of the account pages.",
      },
    ],
    title: "Slack Lumber",
    category: "e-commerce",
    summary:
      "A lumber yard's online store, with a Stripe checkout, reviews, quote requests, pro accounts, and pages for its services and Window Werx windows.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Redux Toolkit",
      "TanStack Query",
      "NextAuth",
      "React Hook Form",
      "Joi",
      "MUI",
      "SCSS",
      "Stripe",
      "Swiper",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/slack-lumber/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Slack Lumber home page with the product slider, a deals panel and category tiles.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/slack-lumber/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Slack Lumber home page: the menu, a Season Deals panel, the product slider and product tiles.",
        caption: "Home page.",
      },
      {
        src: "/projects/slack-lumber/screens/02-categories.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the featured categories on the home page: lumber, sheet goods, hardware, tools, paint and plumbing.",
        caption: "Featured categories.",
      },
      {
        src: "/projects/slack-lumber/screens/03-products.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of All Products with category, price and brand filters, two out-of-stock cards and one marked Added to Cart.",
        caption: "All products with filters.",
      },
      {
        src: "/projects/slack-lumber/screens/04-search.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the header search open with matching products, prices, stock and add-to-cart buttons.",
        caption: "Search in the header.",
      },
      {
        src: "/projects/slack-lumber/screens/05-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a drill kit's product page with a sale price, stock, quantity and Add to Cart.",
        caption: "Product page.",
      },
      {
        src: "/projects/slack-lumber/screens/06-reviews.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the reviews section with three reviews, a rating summary and the Write a comment form.",
        caption: "Product reviews.",
      },
      {
        src: "/projects/slack-lumber/screens/07-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart page with three products, a promo code field and the order summary.",
        caption: "Cart.",
      },
      {
        src: "/projects/slack-lumber/screens/08-quote.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Request a Quote page with two products added through its search.",
        caption: "Quote request.",
      },
      {
        src: "/projects/slack-lumber/screens/09-pro-sign-up.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the first step of the pro sign-up with name, email and password filled in.",
        caption: "Pro account sign-up.",
      },
      {
        src: "/projects/slack-lumber/screens/10-phone-product.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the drill kit's product page on a phone, with stock, the sale price and Add to Cart.",
        caption: "Product page on a phone.",
      },
    ],
    context: [
      "Slack Lumber is a lumber and building-supply yard in Ontario that also sells windows under its Window Werx name.",
      "The shop runs on the ToolSwift commerce platform.",
    ],
    role: ["Front-end developer on the team that built the site, from April 2025."],
    approach: [
      "Next.js 15 with React 19 and TypeScript; pages read store data on the server through server actions, and NextAuth holds the session.",
      "Redux Toolkit for the cart, quotes and wishlist, TanStack Query for search, React Hook Form with Joi for the forms, MUI and SCSS for the interface, Stripe for payment and Swiper for sliders.",
    ],
  },
  {
    slug: "amherst-supply",
    scope:
      "Built the store's website: the online shop with pro pricing, cart and a stepped checkout, sign-in with personal and pro accounts, and the quote, application and order forms.",
    features: [
      {
        title: "Shopping",
        points: [
          "The home page carries banners, featured categories, best sellers, hot deals and last-chance products, with the store's services, story and customer reviews.",
          "Shop by category with a category tree, a price range, brands and sorting.",
          'Product pages have a gallery, wishlist and share buttons, bulk-price tiers such as "Buy 10+, save" and related products.',
          "Signed-in pro customers see the wholesale price wherever it is lower than the shelf price.",
        ],
      },
      {
        title: "Cart and checkout",
        points: [
          "Adding a product opens a cart drawer with each item, sale discounts and the grand total.",
          "Checkout runs in steps: delivery or in-store pickup with a date, shipping, account details and card payment through Stripe, ending on an order confirmation.",
          "The shipping step waits until the postal code stops changing before asking for shipping options.",
        ],
      },
      {
        title: "Sign-in and registration",
        points: [
          "Sign-in, account-type choice, personal sign-up and password reset share one set of form parts: floating-label inputs, selects, checkboxes and a step indicator.",
          "Fields are checked against Joi schemas with the error under each field, and passwords can be shown or hidden with an eye toggle.",
        ],
      },
      {
        title: "Pro accounts for businesses",
        points: [
          "Pro sign-up runs in two steps: basic details first, then the business name and type, phone, address, city, province and postal code.",
          "The province list for Canada comes from the country-state-city package, and the application ends on a message that it is being reviewed.",
        ],
      },
      {
        title: "Requests and forms",
        points: [
          "A quote request takes contact and company details, the supplies needed, a building package and project details, and is sent by EmailJS.",
          "Pages for building packages, account applications, careers, the monthly flyer, Flexiti financing and chick orders.",
          "Six forms check reCAPTCHA before they send.",
        ],
      },
    ],
    decisions: [
      {
        title: "Pro prices only when they help",
        detail:
          "The price shown depends on the session: a pro customer gets the wholesale price only when the product allows pro pricing and that price is lower, and the shelf price is then shown struck through.",
      },
      {
        title: "One form, a schema per step",
        detail:
          "The pro sign-up is a single React Hook Form whose Joi schema switches with the step, so both steps share one set of values and the second step can go back to the first without clearing anything.",
      },
      {
        title: "reCAPTCHA verified on the server",
        detail:
          "A shared hook holds the reCAPTCHA token and a server action checks it with Google, so the secret key never reaches the browser; the same hook protects all six forms and resets after each send.",
      },
    ],
    title: "Amherst Supply",
    category: "e-commerce",
    summary:
      "A building and farm supply store's website, with an online shop, pro pricing for contractors, quote requests and credit applications.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Redux Toolkit",
      "MUI",
      "SCSS",
      "React Hook Form",
      "Joi",
      "NextAuth",
      "Stripe",
      "EmailJS",
      "reCAPTCHA",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/amherst-supply/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Amherst Supply home page with its lumber, pet food and paint banners.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/amherst-supply/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Amherst Supply home page: the promotions bar, search, menu and banners for lumber, pet food and paint.",
        caption: "Home page.",
      },
      {
        src: "/projects/amherst-supply/screens/02-best-sellers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the best sellers section on the home page with product cards and Add to Cart buttons.",
        caption: "Best sellers.",
      },
      {
        src: "/projects/amherst-supply/screens/03-catalogue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of shop by category with the category tree, price and brand filters, sorting and product cards.",
        caption: "Shop by category.",
      },
      {
        src: "/projects/amherst-supply/screens/04-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a product page for a cordless drill with its brand, rating, sale price, quantity and Add To Cart.",
        caption: "Product page.",
      },
      {
        src: "/projects/amherst-supply/screens/05-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart drawer open beside the product with the drill, the sale discount and the grand total.",
        caption: "Cart drawer.",
      },
      {
        src: "/projects/amherst-supply/screens/06-quote-request.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the quote request form with contact, company, supplies needed and building package fields.",
        caption: "Quote request.",
      },
      {
        src: "/projects/amherst-supply/screens/07-account-type.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the account-type choice between personal and pro accounts.",
        caption: "Choosing an account type.",
      },
      {
        src: "/projects/amherst-supply/screens/08-pro-business.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the second pro sign-up step with business name, type, phone, address, province and postal code filled in.",
        caption: "Pro sign-up, business details.",
      },
      {
        src: "/projects/amherst-supply/screens/09-pro-received.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the message that a pro application has been received and is being reviewed.",
        caption: "Application received.",
      },
      {
        src: "/projects/amherst-supply/screens/10-phone-sign-in.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the sign-in page on a phone.",
        caption: "Sign-in on a phone.",
      },
    ],
    context: [
      "Amherst Supply is a building and farm supply store; its website sells online and also takes quote requests, credit applications and chick orders.",
      "The shop runs on the ToolSwift commerce platform.",
    ],
    role: ["Front-end developer on the team that built the site, from December 2024."],
    approach: [
      "Next.js 15 with React 19 and TypeScript, MUI inputs and SCSS modules, Redux Toolkit for the cart and wishlist, React Hook Form and Joi for validation and NextAuth for the session.",
      "Card payments use Stripe, forms send through EmailJS after a reCAPTCHA check in a server action, and the province list comes from the country-state-city package.",
    ],
  },
  {
    slug: "great-north-rc",
    scope:
      "Built the RC store's website: the online shop with store stock and pickup or delivery, a Stripe checkout, and the announcements, popup and working hours that staff edit in Strapi.",
    features: [
      {
        title: "Shopping",
        points: [
          "The home page has a hero slider, a Limited Quantity row of low-stock products, best sellers, the drift and crawler club, brands, reviews and FAQs.",
          "A catalogue with filters, subcategories, search within results and sorting, and product pages that show stock at the store and offer pickup or delivery.",
          "The cart groups items by pickup and delivery, checks promo codes, and checkout pays by card through Stripe.",
        ],
      },
      {
        title: "Content the staff can edit",
        points: [
          "A Strapi content service with three single types: an announcement page of repeatable sections, a site setting with working-hour rows, and a popup.",
          "Each type uses draft and publish, with an API reference for the front end and a plain-language guide for staff.",
        ],
      },
      {
        title: "Announcements and popup",
        points: [
          'The announcements page shows the CMS sections in the editors\' order, alternating picture sides, with a "No announcements yet" panel when there are none.',
          "A site-wide popup opens 2.2 seconds after load; closing it hides it for the visit, and a new edit in the CMS brings it back.",
        ],
      },
      {
        title: "Working hours",
        points: [
          "A View Hours button in the Visit Us section opens a dialog with the opening hours from the CMS, on the home and contact pages, and is disabled while there are none.",
        ],
      },
    ],
    decisions: [
      {
        title: "One server-side CMS client",
        detail:
          "Every CMS read goes through one fetch helper used by server components, so the API token never reaches the browser. In production the answers are cached for an hour; in development they are always fetched fresh so editors see changes at once.",
      },
      {
        title: "The popup is checked before it ships",
        detail:
          "The layout loads the popup on the server and passes it on only when it is switched on and has text, a picture or a usable link. Its dismissal is keyed to the popup's last update, which is why an edit shows it again.",
      },
      {
        title: "Shop lists fetched on the server",
        detail:
          "Best sellers and the low-stock row come from shared server-side shop helpers, so the home page arrives with its products in place, and the Stripe payment intent is created in a server route.",
      },
    ],
    title: "Great North RC",
    category: "e-commerce",
    summary:
      "An RC hobby store and indoor drift track's website, with an online shop and announcements, hours and a popup that staff edit in a CMS.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Strapi",
      "MUI",
      "Jotai",
      "TanStack Query",
      "Stripe",
      "SCSS",
      "Framer Motion",
      "Swiper",
      "EmailJS",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/great-north-rc/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Great North RC catalogue with RC cars, crawlers, tires and batteries.",
      caption: "Catalogue.",
    },
    screens: [
      {
        src: "/projects/great-north-rc/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Great North RC home page: search, the menu and the hero slider with an RC crawler.",
        caption: "Home page.",
      },
      {
        src: "/projects/great-north-rc/screens/02-limited-quantity.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Limited Quantity row on the home page with low-stock products and Add to cart buttons.",
        caption: "Limited Quantity.",
      },
      {
        src: "/projects/great-north-rc/screens/03-catalogue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the catalogue with the filter toggle, subcategories, search within results and product cards.",
        caption: "Catalogue.",
      },
      {
        src: "/projects/great-north-rc/screens/04-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a product page with stock at the store, specifications and a choice of pickup or delivery.",
        caption: "Product page.",
      },
      {
        src: "/projects/great-north-rc/screens/05-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart with an item under pickup, its method chips and a promo code field.",
        caption: "Cart.",
      },
      {
        src: "/projects/great-north-rc/screens/06-home-popup.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the home page with the CMS popup open: a drift car picture, a title, a short message and a button.",
        caption: "Popup from the CMS.",
      },
      {
        src: "/projects/great-north-rc/screens/07-announcements.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the announcements page banner and its first CMS section with a picture and a button.",
        caption: "Announcements page.",
      },
      {
        src: "/projects/great-north-rc/screens/08-announcements-empty.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the announcements page showing the No announcements yet panel with a Shop Now button.",
        caption: "No announcements yet.",
      },
      {
        src: "/projects/great-north-rc/screens/09-hours-dialog.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the working hours dialog over the home page, listing opening hours for each day.",
        caption: "Working hours dialog.",
      },
      {
        src: "/projects/great-north-rc/screens/10-phone-announcements.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the announcements page on a phone, with the picture above the text.",
        caption: "Announcements on a phone.",
      },
    ],
    context: [
      "Great North RC is an RC hobby store with an indoor drift track and a micro crawler club; its website sells online and posts club news.",
      "The shop runs on the ToolSwift commerce platform, and the store's staff edit announcements, hours and the popup in Strapi.",
    ],
    role: [
      "Front-end developer on the team that built the site, from July 2024, and its Strapi content service.",
    ],
    approach: [
      "Next.js 15 with React 19 and TypeScript, MUI and SCSS; Jotai and TanStack Query hold the cart and server data, and CMS content is fetched in server components.",
      "Strapi 5 single types with draft and publish; card payments through Stripe, and the contact form sends through EmailJS.",
    ],
  },
  {
    slug: "home-central-stores",
    scope:
      "Built the store's website: the online shop with store-aware stock, the cart and checkout, CMS-driven home content, and pages for contractors, services, careers and locations.",
    features: [
      {
        title: "Store choice and hours",
        points: [
          "The header shows the chosen store, whether it is open now and when it next opens, with holiday closures counted.",
          "Shoppers switch between the three stores and the showroom from the header or the Locations page, and the choice is remembered in the browser.",
        ],
      },
      {
        title: "Shopping",
        points: [
          "A catalogue with filters, subcategories, search within results and sorting, with its state kept in the URL.",
          "The header search suggests products as you type, limited to a chosen category if one is picked.",
          "Product pages show stock at the chosen store and at the other stores, and offer pickup, delivery or shipping as the item and store allow.",
        ],
      },
      {
        title: "Cart and checkout",
        points: [
          "The cart groups items by pickup, delivery and shipping, lets each item switch method, and checks promo codes.",
          "Checkout collects contact and delivery details and takes the card through Versapay's card fields, which hand the site a token instead of the card number.",
        ],
      },
      {
        title: "Content the store edits",
        points: [
          "Home banners, weekly offers, customer reviews, job openings and the team page come from a Strapi CMS.",
          "Pages for the contractor zone, services, special ordering, custom paint, the showroom, the company's history and careers.",
          "Job pages lead to an application form with validation and a CV upload, sent by EmailJS.",
        ],
      },
    ],
    decisions: [
      {
        title: "Stock worked out per store and method",
        detail:
          "A helper reads each product's inventory by store and works out, for pickup, delivery and shipping, whether the item is available and how many can be ordered. Adding to the cart refuses a quantity above that limit or a method the item does not support.",
      },
      {
        title: "Search that waits for typing to stop",
        detail:
          "The header search waits half a second after the last key before asking the API. Results are cached by category and search text for five minutes and are not fetched again when the window regains focus.",
      },
      {
        title: "Built to be found",
        detail:
          "Product pages carry structured data for the product, its offer, brand, rating and breadcrumbs, and the home page describes the business. Product sitemaps are split into pages of 100 with image entries.",
      },
      {
        title: "Consent before analytics",
        detail:
          "Google's consent mode starts with analytics and ads storage denied; a cookie bar records the visitor's choice and updates consent, so tracking only runs after it is allowed.",
      },
    ],
    title: "Home Central Stores",
    category: "e-commerce",
    summary:
      "A hardware and building-supply retailer's website, with an online shop that knows each store's stock, a contractor zone and CMS-managed content.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "TanStack Query",
      "Jotai",
      "React Hook Form",
      "Joi",
      "Strapi",
      "EmailJS",
      "Swiper",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/home-central-stores/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Home Central Stores home page with the store selector and CMS banners.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/home-central-stores/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Home Central Stores home page: the store selector with opening status, search, the menu and four CMS banners.",
        caption: "Home page.",
      },
      {
        src: "/projects/home-central-stores/screens/02-home-offers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the weekly offers section on the home page, four offer cards from the CMS.",
        caption: "Weekly offers.",
      },
      {
        src: "/projects/home-central-stores/screens/03-catalogue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the catalogue with the filter toggle, subcategories, search within results and product cards.",
        caption: "Catalogue.",
      },
      {
        src: "/projects/home-central-stores/screens/04-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a product page showing out of stock at the chosen store, stock at two other stores, and pickup, delivery and shipping options.",
        caption: "Stock by store.",
      },
      {
        src: "/projects/home-central-stores/screens/05-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart with items grouped under pickup and delivery, method chips on each item and a promo code field.",
        caption: "Cart by fulfilment method.",
      },
      {
        src: "/projects/home-central-stores/screens/06-contractor-zone.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the contractor zone page introducing exclusive access for professional contractors.",
        caption: "Contractor zone.",
      },
      {
        src: "/projects/home-central-stores/screens/07-careers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the careers page listing current openings from the CMS with Apply Now buttons.",
        caption: "Job openings.",
      },
      {
        src: "/projects/home-central-stores/screens/08-locations.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the locations page listing each store with its address, phone, opening status and a Set as My Store button.",
        caption: "Store locations.",
      },
      {
        src: "/projects/home-central-stores/screens/09-services.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the services page with cards for delivery, custom paint matching and special ordering.",
        caption: "Services.",
      },
      {
        src: "/projects/home-central-stores/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the home page on a phone with the menu button, search and stacked banners.",
        caption: "Home on a phone.",
      },
    ],
    context: [
      "Home Central Stores is a hardware and building-supply retailer with three stores and a showroom in upstate New York, serving homeowners and contractors.",
      "The shop runs on the ToolSwift commerce platform, and the store's staff edit banners, offers, jobs and the team in Strapi.",
    ],
    role: ["Front-end developer on the team that built the site, from October 2025 to July 2026."],
    approach: [
      "Next.js 15.5 with React 19 and TypeScript, styled with Tailwind CSS 4 and MUI 7; Jotai and TanStack Query hold the cart, store and server data.",
      "Forms use React Hook Form with Joi; content comes from Strapi 5 and form messages go out through EmailJS.",
    ],
  },
  {
    slug: "filterco",
    scope:
      "Built the water-treatment company's website: a catalogue with search and filters, product pages, a quote list sent with a request form, estimate and contact forms, solutions, and 13 serving-area pages.",
    features: [
      {
        title: "Company website",
        points: [
          "The home page opens on a search box and the featured categories, then solutions by sector, featured products, videos, reasons to choose Filterco and a contact form.",
          "A solutions page with six technology tabs (filtration, softening, reverse osmosis, UV, chemical feed and deionization); the open tab is kept in the address.",
          "Services, industries, a portfolio with tabs, suppliers, a resources hub, FAQs, an about page and the privacy policy.",
        ],
      },
      {
        title: "Serving areas",
        points: [
          "Thirteen location pages, from Vancouver, Burnaby and Surrey to Victoria, Nanaimo, the BC Interior and Yukon, each with its own copy and pictures.",
          "Each page links the services offered there, shows featured products and the areas served as buttons over a map, and ends with a contact form.",
        ],
      },
      {
        title: "Catalogue",
        points: [
          "Categories and products come from the shop API; the product list filters by category, sorts and pages, and shows how many results there are.",
          "Search in the header waits for typing to pause, then lists matching products with a picture, rating and stock, and a button to add each one.",
          "Product pages are rendered on the server, with a breadcrumb, the description, a Request Quote button and a slider of related products.",
        ],
      },
      {
        title: "Quotes and requests",
        points: [
          "Products go into a quote list from cards, search or product pages; the Request Quote button carries the count.",
          "The Request Quote page sets the form (name, business, phone with country, email, message) beside the chosen products, each with a remove button.",
          "Submit stays disabled until every field is filled and the email is valid; the request goes out by email with the product names, ids and quantities, then a notice confirms it.",
          "A free-estimate form with a choice of service, a contact page form, and a footer dialog to report a problem with the website.",
        ],
      },
    ],
    decisions: [
      {
        title: "Quote items keyed by product",
        detail:
          "The quote list is a Redux slice. Adding a product that is already listed raises its quantity instead of adding a second line, and the totals are recalculated on every change, so the form always sends one line per product.",
      },
      {
        title: "Filters live in the address",
        detail:
          "The shop keeps the category, subcategory, sort and page in the query string and reads them back to fetch the list, so a filtered list can be shared, reloaded or reached with the Back button.",
      },
      {
        title: "Search waits for a pause",
        detail:
          "The header search is debounced by 500 ms and runs through TanStack Query with a five-minute cache, so typing a word sends one request and searching the same word again is answered from the cache.",
      },
      {
        title: "The long home page loads in steps",
        detail:
          "Every home section is a dynamic import, and everything below the solutions band mounts only once the visitor scrolls to it, which keeps the first load light.",
      },
    ],
    title: "Filterco",
    category: "landing-pages",
    summary:
      "A water-treatment company's website, with solutions, industries and 13 serving-area pages, a product catalogue with search, and quote and estimate requests.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "MUI",
      "SCSS",
      "Redux Toolkit",
      "TanStack Query",
      "Framer Motion",
      "Swiper",
      "EmailJS",
      "React-Toastify",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/filterco/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Filterco home page with the line Your Trusted Partner in Advanced Water Treatment Solutions.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/filterco/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Filterco home page: the menu, the hero with a treatment plant photo and a product search box.",
        caption: "Home page.",
      },
      {
        src: "/projects/filterco/screens/02-categories.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the featured categories on the home page: filtration, softeners, reverse osmosis, UV, chemical feed and deionization.",
        caption: "Featured categories.",
      },
      {
        src: "/projects/filterco/screens/03-shop.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the product list with category filters, a sort menu and the result count.",
        caption: "Product list with filters.",
      },
      {
        src: "/projects/filterco/screens/04-search.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the header search open with matching products, their ratings, stock and add buttons.",
        caption: "Search in the header.",
      },
      {
        src: "/projects/filterco/screens/05-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a reverse osmosis product page with the breadcrumb, description and Request Quote button.",
        caption: "Product page.",
      },
      {
        src: "/projects/filterco/screens/06-quote-filled.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Request Quote page with the form filled in beside three chosen products.",
        caption: "Quote request.",
      },
      {
        src: "/projects/filterco/screens/07-quote-sent.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Request Quote page after sending, with a confirmation notice and Request Submitted Successfully.",
        caption: "Quote request sent.",
      },
      {
        src: "/projects/filterco/screens/08-solutions.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the solutions page with six technology tabs and the reverse osmosis tab open.",
        caption: "Solutions by technology.",
      },
      {
        src: "/projects/filterco/screens/09-location.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Vancouver page's serving-area section with area buttons over a map.",
        caption: "Serving areas.",
      },
      {
        src: "/projects/filterco/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the Filterco home page on a phone, with the Request Quote button and the hero.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "Filterco is a water-treatment company in Vancouver serving homes, businesses and industry across Western Canada.",
      "The catalogue runs on the ToolSwift commerce platform; customers ask for quotes rather than buying online.",
    ],
    role: ["Front-end developer on the team that built the site, from January 2025."],
    approach: [
      "Next.js 15 with React 19 and TypeScript; product pages are server-rendered and the other pages are static.",
      "MUI and SCSS for the interface, Redux Toolkit for categories and the quote list, TanStack Query for search and filters, Framer Motion and Swiper for motion and sliders, EmailJS for the forms.",
    ],
  },
  {
    slug: "one-lax",
    scope:
      "Built the lacrosse store's website: the shop with stock and custom options, product reviews, the cart and a Stripe checkout, sign-in with email verification, and team gear orders.",
    features: [
      {
        title: "Shopping",
        points: [
          "The home page opens on the glove line, then featured categories, stick and glove rows, testimonials, the brand's story and a contact form.",
          "Shop pages by category, and product pages that show low stock, pickup at the store, quantity limits and custom input fields where a product has them.",
          'Adding a product shows a "Product added to cart" notice and opens the cart panel, which stays open while items are removed.',
        ],
      },
      {
        title: "Product reviews",
        points: [
          'Each product page lists its reviews as cards with a title, the text, a star rating, the reviewer\'s name and the date, or "Be the First to write a Review".',
          "Signed-in customers rate a product in a Rate Our Product form with a title, a description and agreement to the privacy policy; on a phone it opens as a drawer.",
          "A success notice closes the form and the list refreshes; when the API refuses a review, its own message is shown.",
        ],
      },
      {
        title: "Checkout",
        points: [
          "Checkout runs through account details, delivery, the shipping method and card payment through Stripe.",
        ],
      },
      {
        title: "Accounts and orders",
        points: [
          "Sign-in with email or Google, personal and pro sign-up, and password reset.",
          "The link in the verification email opens a page that confirms the account, saves the sign-in and moves on to the login page, or shows the API's reason with a button to try again.",
          "A team gear order form, news pages and a page for the GameChanger partnership.",
        ],
      },
    ],
    decisions: [
      {
        title: "The customer is read on the server",
        detail:
          "The product page is rendered on the server, where helpers read the sign-in cookie and decode its token to find the customer's id. The page passes the id and token down to the review components, so the browser code never decodes the token itself.",
      },
      {
        title: "Verification errors are returned, not thrown",
        detail:
          "The verification call uses a request helper that hands back the API's error body instead of throwing, so the page can tell success from failure and show the API's own reason.",
      },
      {
        title: "Reviews in the shared API layer",
        detail:
          "The review endpoints sit in the site's RTK Query API layer, with typed requests and cache tags next to the product and category endpoints, and the list is refetched after a review is sent.",
      },
    ],
    title: "One Lax",
    category: "e-commerce",
    summary:
      "A lacrosse store's online shop, with product reviews from signed-in customers, a Stripe checkout and email verification for new accounts.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Redux Toolkit",
      "RTK Query",
      "TanStack Query",
      "MUI",
      "SCSS",
      "Stripe",
      "Firebase Auth",
      "React-Toastify",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/one-lax/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the One Lax home page with its glove hero, Be the One Play With Purpose.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/one-lax/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the One Lax home page: the menu and the hero with two gloves and the line Be the One Play With Purpose.",
        caption: "Home page.",
      },
      {
        src: "/projects/one-lax/screens/02-featured-categories.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the featured categories on the home page with sticks, gloves, team apparel and protective gear.",
        caption: "Featured categories.",
      },
      {
        src: "/projects/one-lax/screens/03-shop.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the shop page listing all categories with picture cards.",
        caption: "Shop by category.",
      },
      {
        src: "/projects/one-lax/screens/04-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a glove's product page with the sale price, low stock, pickup at the store, quantity and Add to Cart.",
        caption: "Product page.",
      },
      {
        src: "/projects/one-lax/screens/05-reviews.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the reviews section on a One Lax product page, with three review cards and a Write a Review button.",
        caption: "Reviews on a product page.",
      },
      {
        src: "/projects/one-lax/screens/06-review-filled.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Rate Our Product form with five stars, a title, a description and the privacy box ticked.",
        caption: "Writing a review.",
      },
      {
        src: "/projects/one-lax/screens/07-review-added.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the reviews section after sending, with the new review first and a Review submitted successfully notice.",
        caption: "The new review in the list.",
      },
      {
        src: "/projects/one-lax/screens/08-added-to-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart panel open beside a product page with a Product added to cart notice.",
        caption: "Added-to-cart notice.",
      },
      {
        src: "/projects/one-lax/screens/09-link-expired.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the email verification page for an expired link, with an error notice and a Resend Verification Email button.",
        caption: "Expired verification link.",
      },
      {
        src: "/projects/one-lax/screens/10-phone-reviews.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of a product's reviews on a phone, with the rating summary, a Write a Review button and review cards.",
        caption: "Reviews on a phone.",
      },
    ],
    context: [
      "One Lax is a lacrosse brand and store; its website sells sticks, gloves, team apparel and gear online.",
      "The shop runs on the ToolSwift commerce platform.",
    ],
    role: ["Front-end developer on the team that built the site, from December 2024."],
    approach: [
      "Next.js 15 with React 18 and TypeScript; the product page is a server component that reads the sign-in cookie, and data comes through RTK Query and TanStack Query.",
      "MUI and SCSS for the interface, Redux Toolkit with redux-persist for the cart, Stripe for payment, Firebase for Google sign-in and React-Toastify for notices.",
    ],
  },
  {
    slug: "toolswift-marketing",
    scope:
      "Built the ToolSwift marketing site: the home sections, the header and its Resources menu, the articles, the Help Center and the demo-request form.",
    features: [
      {
        title: "Articles",
        points: [
          "Articles come from the Strapi CMS by category, with a View All tab, cards and a page per article.",
          "Each article has a contents list that marks the section in view, highlighted lists, pictures and an author.",
          "Pictures open in a lightbox with zoom, pan and reset, and a share rail offers LinkedIn, copy link, the share sheet and email.",
        ],
      },
      {
        title: "Help and demo requests",
        points: [
          "A Help Center page with a form for name, website, subject, description, email and phone.",
          "The Help Center and demo forms check required fields and email format, disable sending while a request is out, and ask for reCAPTCHA.",
        ],
      },
      {
        title: "Navigation",
        points: [
          "The header has menus for the B2B feature pages and for Resources (the blog and the Help Center), each item with an icon and a line of description.",
        ],
      },
    ],
    decisions: [
      {
        title: "Articles by slug, refreshed from the CMS",
        detail:
          "Article pages are looked up by slug in Strapi and regenerated at most every five minutes, so an edit in the CMS reaches the site without a new deploy.",
      },
      {
        title: "reCAPTCHA checked on the server",
        detail:
          "The forms collect a reCAPTCHA token in the browser, and a server function verifies it with Google before the request counts.",
      },
      {
        title: "One contents list for every screen",
        detail:
          "On a desktop the contents sit beside the article and follow the reader's position; on a phone the same list opens from a floating button as a sheet.",
      },
      {
        title: "Lightbox outside the article layout",
        detail:
          "The image lightbox renders through a React portal into the document body. Opening it locks page scrolling; closing it restores the previous scroll setting and keyboard focus.",
      },
    ],
    title: "ToolSwift marketing site",
    category: "landing-pages",
    summary:
      "The public site for ToolSwift: the home page, a page per B2B feature, the customer portal, articles from the CMS and a Help Center.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "MUI",
      "Radix UI",
      "Framer Motion",
      "GSAP",
      "Strapi",
      "reCAPTCHA",
      "EmailJS",
    ],
    period: "2025",
    progress: "in-progress",
    image: {
      src: "/projects/toolswift-marketing/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the ToolSwift home page: the dark hero with the header and the headline The CMS Built for B2B E-commerce and Distributors.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/toolswift-marketing/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the ToolSwift home page hero: the header with its menus and the headline for B2B e-commerce and distributors.",
        caption: "Home page.",
      },
      {
        src: "/projects/toolswift-marketing/screens/02-home-why.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the home page section Why Distributors Choose ToolSwift: six reasons with icons and a warehouse photo.",
        caption: "Home page section.",
      },
      {
        src: "/projects/toolswift-marketing/screens/03-resources-menu.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Resources menu open over the hero: Learning with the blog and Support with the Help Center.",
        caption: "Resources menu.",
      },
      {
        src: "/projects/toolswift-marketing/screens/04-feature-quotes.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the quotes feature page: Smarter B2B Quoting Starts Here and a section on quotes that sync automatically.",
        caption: "A feature page.",
      },
      {
        src: "/projects/toolswift-marketing/screens/05-customer-portal.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the customer portal page: the hero and the dedicated account dashboard section with a portal preview.",
        caption: "Customer portal page.",
      },
      {
        src: "/projects/toolswift-marketing/screens/06-blog.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the blog: category tabs with View All and article cards with tag, date, title and summary.",
        caption: "Blog.",
      },
      {
        src: "/projects/toolswift-marketing/screens/07-article.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an article: the contents list with the current section marked, the share rail and the first picture.",
        caption: "Article.",
      },
      {
        src: "/projects/toolswift-marketing/screens/08-image-lightbox.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an article picture open in the lightbox, with zoom out, zoom level, zoom in, full screen and close.",
        caption: "Image lightbox.",
      },
      {
        src: "/projects/toolswift-marketing/screens/09-help-center.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Help Center form filled in: name, website, subject, description, email and phone.",
        caption: "Help Center form.",
      },
      {
        src: "/projects/toolswift-marketing/screens/10-phone-article.png",
        width: 780,
        height: 1688,
        kind: "capture",
        view: "phone",
        alt: "Capture of an article on a phone: the share buttons, the first picture, the text and the floating contents button.",
        caption: "Article on a phone.",
      },
    ],
    context: [
      "The public marketing site for ToolSwift, the headless commerce platform for distributors.",
      "Pages: home, customer portal, sixteen B2B feature pages, the blog and its articles, the Help Center and contact.",
    ],
    role: [
      "Front-end developer on the site's team since July 2025: the articles, the Help Center, the Resources menu, the home sections and the reCAPTCHA checks.",
    ],
    approach: [
      "Next.js 15 with React and TypeScript, styled with Tailwind CSS 3, MUI and Radix UI, with Framer Motion and GSAP for motion.",
      "Articles are read from Strapi on the server; forms send through EmailJS after the reCAPTCHA check.",
    ],
  },
  {
    slug: "camufacturing-site",
    scope:
      "Built the CAM software company's website: the home page, APlus product pages, maintenance and training, the Thermic simulation page, research, an about page with staff and partners from Strapi, FAQs and contact.",
    features: [
      {
        title: "Pages",
        points: [
          "The home page introduces the CAM software with video tiles, a worldwide-reach map, the APlus hybrid manufacturing story, customer quotes and a contact form.",
          "The APlus page presents the four product levels (DED, FSD, ME and FSW), why to choose APlus, distributors, training, maintenance and FAQs.",
          "Pages for software maintenance and support, product training, other software solutions, and Thermic, a real-time thermal simulation for additive manufacturing.",
          "A research page with highlights and publications, and an about page with the company's mission, vision and values, founders, team, partners and memberships.",
        ],
      },
      {
        title: "Content and contact",
        points: [
          "Team members, OEM partners and publications come from Strapi; the president and vice president appear with the founders, everyone else in the team.",
          "The FAQs page and the APlus questions open as accordions.",
          "The contact form checks each field (names, email, phone with country, message), sends through EmailJS and shows a confirmation or an error for five seconds.",
          "The header's Login button opens the company's customer dashboard.",
        ],
      },
    ],
    decisions: [
      {
        title: "Videos load only when played",
        detail:
          "Each video tile shows the YouTube thumbnail with a play button and swaps in the embedded player only when it is clicked, so the pages load no YouTube player until a visitor asks for one.",
      },
      {
        title: "Static pages with CMS refresh",
        detail:
          "Strapi requests go through one helper that adds the API token and revalidates every 60 seconds, so the pages stay static and pick up new team members, partners or publications within a minute; a failed request returns an empty list and the page still renders.",
      },
      {
        title: "Sections reveal as they arrive",
        detail:
          "A shared AnimatedSection fades and lifts each section once when a tenth of it scrolls into view (Framer Motion with an intersection observer), and every page fades in through one transition.",
      },
      {
        title: "Files for search engines and agents",
        detail:
          "The site serves robots.txt, sitemap.xml and an llms.txt route that describes the company for AI agents, alongside per-page metadata.",
      },
    ],
    title: "Camufacturing website",
    category: "landing-pages",
    summary:
      "The CAM software company's website, presenting APlus for hybrid manufacturing, Thermic simulation, training, maintenance and research, with content from Strapi.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "SCSS",
      "Framer Motion",
      "Strapi",
      "EmailJS",
      "Google Analytics",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/camufacturing-site/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Camufacturing APlus page with the headline APlus Revolutionizes Hybrid Manufacturing.",
      caption: "APlus page.",
    },
    screens: [
      {
        src: "/projects/camufacturing-site/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Camufacturing home page hero, Revolutionizing advanced manufacturing with precise, efficient and reliable CAM software.",
        caption: "Home page.",
      },
      {
        src: "/projects/camufacturing-site/screens/02-reach.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Worldwide reach section with a world map of the countries served.",
        caption: "Worldwide reach.",
      },
      {
        src: "/projects/camufacturing-site/screens/03-aplus.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the APlus page hero, APlus Revolutionizes Hybrid Manufacturing, and Putting AM in Your CAM.",
        caption: "APlus page.",
      },
      {
        src: "/projects/camufacturing-site/screens/04-aplus-levels.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the four APlus product levels: DED, FSD, ME and FSW.",
        caption: "APlus product levels.",
      },
      {
        src: "/projects/camufacturing-site/screens/05-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the about page's core beliefs: mission, vision and five values.",
        caption: "About: core beliefs.",
      },
      {
        src: "/projects/camufacturing-site/screens/06-research.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the research highlights: void identification, multi-axis toolpath planning and part boundary visualisation.",
        caption: "Research highlights.",
      },
      {
        src: "/projects/camufacturing-site/screens/07-publications.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Our Publications, entries by year from the CMS with the 2025 entry open.",
        caption: "Publications from the CMS.",
      },
      {
        src: "/projects/camufacturing-site/screens/08-thermic.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Thermic page, Thermal Simulation for Additive Manufacturing.",
        caption: "Thermic simulation page.",
      },
      {
        src: "/projects/camufacturing-site/screens/09-contact-sent.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the contact page after sending, with Message received. Thank you very much.",
        caption: "Contact form sent.",
      },
      {
        src: "/projects/camufacturing-site/screens/10-phone-home.png",
        view: "phone",
        width: 780,
        height: 1688,
        kind: "capture",
        alt: "Capture of the Camufacturing home page hero on a phone.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "Camufacturing Solutions makes CAM software for additive and hybrid manufacturing; APlus is its add-on for Mastercam.",
      "The site sits beside the company's customer dashboard, which its Login button opens.",
    ],
    role: ["Front-end developer on the team that built the site, from March 2025."],
    approach: [
      "Next.js 15 with React 19 and TypeScript; the pages are static and the Strapi content is refreshed every minute.",
      "SCSS modules for the dark industrial look, Framer Motion with an intersection observer for section reveals, EmailJS for the contact form and Google Analytics.",
    ],
  },
  {
    slug: "smooth-erp-landing-pages",
    scope:
      "Built the Smooth ERP marketing site in Arabic and English, and the sign-up where a company picks its modules and gets its own ERP workspace.",
    features: [
      {
        title: "A marketing site in two languages",
        points: [
          "The home page walks through the product: what it is, why it, eight areas it manages, the fields it serves, the mobile and desktop apps, and a price request form.",
          "Arabic is the default and reads right to left; English reads left to right, and the language switch keeps the visitor on the same page.",
          "Point of sale, construction and factories each have their own page with the advantages for that field.",
        ],
      },
      {
        title: "Sign-up that creates a workspace",
        points: [
          "Visitors choose the modules they need (projects, stores, accounts, point of sale) as toggles, and a summary lists the choice with a way to remove each one.",
          "The organization name becomes the workspace address, so it is shown live as name.smootherp.com and checked: lowercase letters, numbers and hyphens.",
          "Choosing point of sale asks how many sales points will use the system.",
          "After sign-up a panel shows the workspace address and counts down before opening it, with a button to open it straight away.",
        ],
      },
      {
        title: "From a field page to sign-up",
        points: [
          "The point of sale and construction pages end with a button that opens sign-up with that module already chosen, next to the price request.",
        ],
      },
      {
        title: "Accounts and contact",
        points: [
          "Sign-in, and a profile page where a customer edits their details.",
          "The price request form is validated on the server and confirms or reports the error in place.",
        ],
      },
    ],
    decisions: [
      {
        title: "Direction comes from the language",
        detail:
          "The page direction is set from the locale and the components use start and end instead of left and right, so one layout serves Arabic right to left and English left to right without a switch per language.",
      },
      {
        title: "Check the name before it becomes an address",
        detail:
          "The organization name is lowercased and checked against the rules for a subdomain before it is sent, because it becomes the workspace address. Modules are sent in the form the API expects, built fresh on every attempt.",
      },
      {
        title: "Forms through server actions",
        detail:
          "Sign-up, sign-in, the profile and the price request go through Next.js server actions. The session is kept in a cookie that middleware reads to guard the profile, sign-in and sign-up routes.",
      },
      {
        title: "Search details per page and language",
        detail:
          "Each page sets its own title, description and sharing tags in both languages, field pages add schema.org structured data, and the sitemap and robots file are generated at build time.",
      },
    ],
    title: "Smooth ERP landing pages",
    category: "landing-pages",
    summary:
      "The Smooth ERP marketing site in Arabic and English: pages for each business field and a sign-up where a company picks its modules and gets its own workspace.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "next-intl",
      "React Hook Form",
      "Framer Motion",
      "next-sitemap",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/smooth-erp-landing-pages/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Smooth ERP landing pages English home page, shown with sample data.",
      caption: "English home page.",
    },
    screens: [
      {
        src: "/projects/smooth-erp-landing-pages/screens/01-home-ar.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages Arabic home page, right to left, shown with sample data.",
        caption: "Arabic home page, right to left.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/02-home-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages English home page, left to right, shown with sample data.",
        caption: "English home page, left to right.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/03-features-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages section on why Smooth ERP, listing the areas it manages, shown with sample data.",
        caption: "Why Smooth ERP: the areas it manages.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/04-fields-ar.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages Arabic fields section with cards for point of sale, construction and factories, shown with sample data.",
        caption: "Fields of work in Arabic.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/05-field-pos-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages point of sale page ending with a button to start sign-up with point of sale chosen, shown with sample data.",
        caption: "Point of sale page: start sign-up with the module chosen.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/06-register-modules-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages sign-up with three modules chosen and listed in a summary, shown with sample data.",
        caption: "Sign-up: choosing modules.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/07-register-details-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages sign-up form filled in, with the workspace address preview and the number of sales points, shown with sample data.",
        caption: "Sign-up details with the workspace address.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/08-register-invalid-ar.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages Arabic sign-up rejecting an organization name that cannot be a workspace address, shown with sample data.",
        caption: "Arabic sign-up checking the workspace name.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/09-register-success-en.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Smooth ERP landing pages sign-up result: the workspace address, a countdown and a button to open it, shown with sample data.",
        caption: "After sign-up: the workspace is being prepared.",
      },
      {
        src: "/projects/smooth-erp-landing-pages/screens/10-phone-register-ar.png",
        width: 780,
        height: 1688,
        kind: "capture",
        view: "phone",
        alt: "Capture of the Smooth ERP landing pages Arabic sign-up on a phone, with point of sale chosen from its field page, shown with sample data.",
        caption: "Arabic sign-up on a phone.",
      },
    ],
    context: [
      "Smooth ERP is sold to companies by subscription, and each company gets its own workspace on a subdomain. This site is where a company finds the product and signs up.",
      "Pages: home, one page per field (point of sale, construction, factories), sign-up, sign-in, profile and careers.",
    ],
    role: [
      "Front-end developer: built the marketing site and its sign-up from September to December 2024. The CV records designing and implementing a landing page with a subscription system.",
    ],
    approach: [
      "Next.js 14 (App Router) with TypeScript and Tailwind CSS, in Arabic and English through next-intl, with the language in the address.",
      "Forms use React Hook Form and server actions; motion uses Framer Motion and a typed headline uses react-typed; sections below the first screen load through dynamic imports.",
    ],
    outcomes: ["The landing page uses Next.js server rendering to improve SEO and performance."],
  },
  {
    slug: "falcons-gt-motors",
    scope:
      "Built the Falcons GT Motors site in Arabic, English and French: home, a filterable vehicle list, vehicle pages with an export enquiry, About and Contact.",
    features: [
      {
        title: "Finding a vehicle",
        points: [
          "The home search offers maker, then that maker's models, year and cylinders from the vehicles in stock, and opens the list with those filters.",
          "Browse-by-type and brand tiles show how many vehicles each holds; tabs show the newest three of each type.",
          "The vehicle list filters by type, maker, model, years, cylinders, gearbox, fuel and Belgium or Dubai, and sorts by year, mileage or name.",
          "Filters live in the address and show as removable chips, so a filtered list can be shared or reloaded; an empty result offers to clear or ask.",
        ],
      },
      {
        title: "Vehicle pages and enquiries",
        points: [
          "Each vehicle has key facts, full specifications, price on request and similar vehicles of the same type first.",
          "An export enquiry asks for the destination country and shipping by sea, land or air, checks every field and confirms with the vehicle, country and method.",
          "WhatsApp, phone and email links appear when their settings are given; the Luxury site is linked the same way.",
        ],
      },
      {
        title: "Three languages, any screen",
        points: [
          "Every page in Arabic (the default, right to left), English and French, with a language switch that keeps the page and its filters.",
          "Phones get a menu, a search under the slider and filters that fold away; the selects, tabs and forms work with a keyboard.",
          "Unknown addresses show a 404 inside the site's layout in the visitor's language.",
        ],
      },
    ],
    decisions: [
      {
        title: "One set of filtering rules",
        detail:
          "The home search, the type tabs, the tiles and the vehicle list all go through one module that filters and sorts the catalogue, so a count on a tile always matches the list it opens.",
      },
      {
        title: "The address holds the filters",
        detail:
          "Filters are query parameters read on the server, so the list renders filtered on first load. Changes go through one hook that keeps the latest filters, so two quick clicks both count before the page re-renders.",
      },
      {
        title: "Only pages with content",
        detail:
          "The navigation listed nine pages that did not exist. It now holds the pages that do, and Luxury, a separate site, is linked from a setting instead of a dead route.",
      },
      {
        title: "Mirrored layouts, not copies",
        detail:
          "Spacing and positions use start and end instead of left and right, and Arabic pages switch to Cairo, since the Latin font has no Arabic letters, so one set of components serves all three languages.",
      },
    ],
    title: "Falcons GT Motors",
    category: "interactive-websites",
    summary:
      "A car trading and export site in three languages: vehicle search, a filterable list, vehicle pages with an export enquiry, and company pages.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "next-intl",
      "Swiper",
      "React Icons",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/falcons-gt-motors/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Falcons GT Motors home page with the hero slide, the navigation and the vehicle search bar, shown with sample data.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/falcons-gt-motors/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors home page with the first hero slide, the navigation and the search by maker, model, year and cylinders, shown with sample data.",
        caption: "Home page.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/02-browse-by-type.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors browse-by-type tiles with a vehicle count on each, under the search bar, shown with sample data.",
        caption: "Browse by type.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/03-explore-by-type.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors vehicle tabs with SUV selected and its three newest vehicles as cards, shown with sample data.",
        caption: "Vehicles by type.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/04-vehicles-filtered.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors vehicle list filtered to SUVs and sorted by lowest mileage, with the filter panel, a removable chip and the result count, shown with sample data.",
        caption: "Vehicle list with filters.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/05-vehicle.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a Falcons GT Motors vehicle page with the photo, key facts, price on request and the enquiry and WhatsApp buttons, shown with sample data.",
        caption: "Vehicle page.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/06-export-enquiry.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors export enquiry filled in with a destination country and shipping by sea, shown with sample data.",
        caption: "Export enquiry.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/07-arabic-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors home page in Arabic, right to left, with the mirrored navigation, hero slide and search, shown with sample data.",
        caption: "Home page in Arabic.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/08-arabic-vehicles.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors vehicle list in Arabic filtered to Dubai, with the filters on the right, shown with sample data.",
        caption: "Vehicle list in Arabic.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/09-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons GT Motors About page with the two locations, Belgium since 1973 and Dubai since 2015, and the services, shown with sample data.",
        caption: "About Us.",
      },
      {
        src: "/projects/falcons-gt-motors/screens/10-phone-vehicle.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of a Falcons GT Motors vehicle page on a phone, with the breadcrumb, photo and key facts stacked, shown with sample data.",
        caption: "Vehicle page on a phone.",
      },
    ],
    context: [
      "Falcons GT Motors trades and exports cars from Belgium and Dubai. The site presents the vehicles in stock and takes export enquiries.",
      "Pages: home, vehicles, each vehicle, About Us and Contact Us, in Arabic, English and French.",
    ],
    role: [
      "Front-end developer: built the site in March 2025, then completed it in a second pass on the same code: the catalogue, the vehicle pages, the inner pages, translations and phone layouts.",
    ],
    approach: [
      "Next.js 15 App Router with React 19 and TypeScript, Tailwind CSS 4 with the brand's blue and gold, next-intl for three languages and Swiper for the hero.",
      "The catalogue, its filters and the enquiry each sit behind one module, so an API can replace the sample data without touching the pages.",
    ],
  },
  {
    slug: "falconsgt-sml",
    scope:
      "Built the SML Isuzu site: range pages, a model browser with specifications and comparison, quote requests and campaign pages for three markets, in English and Portuguese.",
    features: [
      {
        title: "Choosing a vehicle",
        points: [
          "Trucks and buses each have a page; series and model tabs sit over a photo gallery and the model's specification table, and arrow keys move between tabs.",
          "The chosen model sits in the address, so a link to a truck opens that truck.",
          "The gallery counts its photos and its buttons are labelled; photos the client marked as illustrative say so.",
        ],
      },
      {
        title: "Comparing and asking for a price",
        points: [
          "Up to three models side by side, one row per specification, with an option to show only the differences.",
          "Ask for Price fills the quote request with the model's type and model, and puts the cursor in the form.",
          "The form checks each field and explains the problem under it; the quantity must be one or more.",
        ],
      },
      {
        title: "One site, three markets, two languages",
        points: [
          "Campaign pages for Tanzania (GS trucks), Kenya, Uganda, Zambia, Mozambique and Malawi, and Angola (S7 buses), each with its own models, country codes, logo and enquiry provider.",
          "A country link sends visitors to their page, and offers a choice when the country cannot be found.",
          "Every page in English and Portuguese, for Angola and Mozambique; ?lang=pt opens a campaign link in Portuguese.",
          "Every page fits a phone, and the map loads from Google only when the visitor asks for it.",
        ],
      },
    ],
    decisions: [
      {
        title: "One catalogue for every page",
        detail:
          "The model data stays in the client's JSON files; one module groups it into categories and series for each page and gives each model an address from its name. The tabs, the form and the comparison all read it.",
      },
      {
        title: "Ask for Price fills the form",
        detail:
          "A shared context links every price button on a page to that page's form, so a buyer never picks the model twice.",
      },
      {
        title: "Each campaign page keeps its settings",
        detail:
          "Provider, country codes, logos and map sit in one settings object per page; other pages fall back to the main site's. The home page form used to crash because it had no settings.",
      },
      {
        title: "The map waits for a click",
        detail:
          "Each page used to load a Google Maps embed. A location card with Show map and Open in Google Maps now loads the map only on request.",
      },
    ],
    title: "FalconsGT SML Isuzu",
    category: "interactive-websites",
    summary:
      "A site for SML Isuzu trucks and buses in English and Portuguese: a model browser with specifications and comparison, quote requests and campaign pages per market.",
    builtWith: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "React Router",
      "i18next",
      "Embla Carousel",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/falconsgt-sml/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the FalconsGT SML Isuzu home page with the navigation, the language switch and the hero with links to the trucks and the buses.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/falconsgt-sml/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the FalconsGT SML Isuzu home page with the navigation, the language switch and the hero with links to the trucks and the buses.",
        caption: "Home page.",
      },
      {
        src: "/projects/falconsgt-sml/screens/02-trucks.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the trucks page model browser with the GS and NON-GS series tabs, the GS Super Truck selected, its photo counter and the Ask for Price and Add to compare buttons.",
        caption: "Truck model browser.",
      },
      {
        src: "/projects/falconsgt-sml/screens/03-bus-specs.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a Hiroi bus's gallery thumbnails and its specification table, with price on request.",
        caption: "Bus specifications.",
      },
      {
        src: "/projects/falconsgt-sml/screens/04-compare.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of three buses compared side by side, one row per specification, with the option to show only the differences.",
        caption: "Compare models.",
      },
      {
        src: "/projects/falconsgt-sml/screens/05-enquiry.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the quote request after Ask for Price, with the NON-GS series and the Samrat Truck already chosen, shown with sample contact details.",
        caption: "Quote request.",
      },
      {
        src: "/projects/falconsgt-sml/screens/06-tanzania.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Tanzania campaign page with the trucks and buses tabs and the GS Prestige Truck, marked right-hand drive.",
        caption: "Tanzania campaign page.",
      },
      {
        src: "/projects/falconsgt-sml/screens/07-angola-portuguese.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Angola campaign page in Portuguese, with the Angola branch logo and a WhatsApp enquiry button.",
        caption: "Angola page in Portuguese.",
      },
      {
        src: "/projects/falconsgt-sml/screens/08-contact.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Contact Us page with the Dubai office and the Angola branch, each with a map link.",
        caption: "Contact Us.",
      },
      {
        src: "/projects/falconsgt-sml/screens/09-about.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the About page with the SML Isuzu introduction and a photo of the factory.",
        caption: "About SML Isuzu.",
      },
      {
        src: "/projects/falconsgt-sml/screens/10-phone-bus.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of an S7 bus on a phone, with the model tabs, full-width buttons and the photo counter.",
        caption: "Bus on a phone.",
      },
    ],
    context: [
      "Falcons sells SML Isuzu trucks and buses from Dubai to East and Southern Africa, and through its branch in Angola. The site presents the range and takes quote requests.",
      "Pages: home, trucks, buses, About, Contact, and campaign pages for Tanzania, for Kenya, Uganda, Zambia, Mozambique and Malawi, and for Angola.",
    ],
    role: [
      "Front-end developer on the team in February and March 2025, then completed the site in a second pass on the same code: range pages, comparison, the enquiry flow, Portuguese and phone layouts.",
    ],
    approach: [
      "A Vite single-page app with React 19, TypeScript, Tailwind CSS 4 and React Router 7; i18next loads English and Portuguese, and Embla runs the stories carousel.",
      "Enquiries use React 19 form actions and Axios; the vehicle data stays in JSON files, read through one catalogue module.",
    ],
  },
  {
    slug: "falconsgt-luxury",
    scope:
      "Built the Falcons Luxury Motors site: collection filters, vehicle pages, comparison and campaign pages with lead forms, in English and Arabic.",
    features: [
      {
        title: "Finding a car",
        points: [
          "Brand, model, year, type and cylinder filters live in the address, so a search can be shared, reloaded and undone with Back; models narrow to the chosen brand.",
          "A result count, the active filters as removable chips, sorting by model year, and pages that open at the top of the results.",
          "Every select works from the keyboard (arrows, Enter, Escape, type-ahead), and the navbar menus open on focus.",
        ],
      },
      {
        title: "A page for each car",
        points: [
          "A photo gallery with a full-screen viewer; every photo carries the showroom's logo as a watermark.",
          "Overview, technical specifications, interior and exterior features, a brochure when the car has one, and similar cars of the same body type.",
          "The enquiry form sends the car and its page to the client's CRM, with a country code for the phone.",
          "Share opens the phone's share sheet, or copies the link.",
        ],
      },
      {
        title: "Comparison and campaigns",
        points: [
          "Up to three cars side by side, kept in the address so a comparison can be shared, with an option to show only the differences.",
          "Campaign pages for the GAC GS8 and the Mercedes-Benz C200, with the client's artwork and a lead form that asks how the buyer will pay; Offers lists them.",
          "Every page in English and Arabic, right to left, and every page fits a phone.",
        ],
      },
    ],
    decisions: [
      {
        title: "Filters belong in the address",
        detail:
          "The vehicles page kept its filters in component state and reset them on arrival, so a search from the home page showed every car. One hook now reads brand, model, year, type, cylinder, sort and page from the address and writes them back; the old links by body type still open that type.",
      },
      {
        title: "A comparison that can be sent",
        detail:
          "The first car came from the browser's storage, so opening /compare directly crashed. The compared cars now live in the address and the browser remembers the list, so pressing Compare on several car pages builds one comparison.",
      },
      {
        title: "Hidden fields reach the CRM",
        detail:
          'The shared form input never rendered a hidden field\'s value, so campaign and vehicle enquiries sent the placeholder "Your Brand" instead of the car. Hidden fields are now plain hidden inputs, and the vehicle form adds the car.',
      },
      {
        title: "Lighter watermarks",
        detail:
          "Photos are watermarked on a canvas in the browser and cached. They used to become full-size PNG data; they are now scaled to the size the site shows and kept as JPEG, and a photo that fails to load keeps its plain address.",
      },
    ],
    title: "FalconsGT Luxury",
    category: "interactive-websites",
    summary:
      "A luxury car showroom site in English and Arabic: a filterable collection, car pages with enquiries, side-by-side comparison and model campaign pages.",
    builtWith: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "React Router",
      "TanStack Query",
      "i18next",
      "Embla Carousel",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/falconsgt-luxury/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Falcons Luxury Motors home page: the search card with Mercedes-Benz and the G63 AMG chosen, over the hero video of the showroom's lit logo.",
      caption: "Home page search.",
    },
    screens: [
      {
        src: "/projects/falconsgt-luxury/screens/01-home-search.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcons Luxury Motors home page: the search card with Mercedes-Benz and the G63 AMG chosen, over the hero video of the showroom's lit logo.",
        caption: "Home page search.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/02-vehicles-filters.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the vehicles page filtered to SUVs: the filters, 8 vehicles, a removable Type: SUV chip, Clear all, sorting by newest model year and the first cars.",
        caption: "Collection filters.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/03-vehicle-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a Range Rover Sport SV page: breadcrumb, title, year, body, gearbox and fuel, Share and Compare, and the photo gallery with the showroom watermark.",
        caption: "Car page.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/04-vehicle-specifications.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the same car's description and its technical specifications opened: engine, power output, drive type and seating capacity.",
        caption: "Car specifications.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/05-similar-vehicles.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Similar vehicles section under a car page: three SUVs and a View all button.",
        caption: "Similar cars.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/06-compare.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of three cars compared side by side with only the differences shown: model year, engine, power output and interior and exterior features.",
        caption: "Compare three cars.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/07-offers-campaigns.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Offers page listing the GAC GS8 and Mercedes-Benz C200 campaigns, each with its payment choices and a View offer link.",
        caption: "Current campaigns.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/08-campaign-c200.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Mercedes-Benz C200 campaign page: the client's artwork and a lead form with name, email, phone with country code and payment.",
        caption: "C200 campaign page.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/09-arabic-vehicles.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the vehicles page in Arabic, right to left, filtered to Mercedes-Benz and sorted by newest model year.",
        caption: "Arabic collection.",
      },
      {
        src: "/projects/falconsgt-luxury/screens/10-phone-vehicle.png",
        width: 780,
        height: 1688,
        kind: "capture",
        view: "phone",
        alt: "Capture of the Mercedes-Benz C200 page on a phone: title, facts in two columns, Share and Compare, and the photo gallery.",
        caption: "Car page on a phone.",
      },
    ],
    context: [
      "Falcons Luxury Motors sells luxury cars from its showroom at Al Awir Auto Market in Dubai. The site presents the collection and takes enquiries.",
      "Pages: home, vehicles and a page per car, compare, offers, gallery, about, contact, and campaign pages for the GAC GS8 and the Mercedes-Benz C200.",
    ],
    role: [
      "Front-end developer on the team from January to March 2025, then completed the site in a second pass on the same code: filters, comparison by link, offers, enquiry fixes, keyboard access and page titles.",
    ],
    approach: [
      "A Vite single-page app with React 18, TypeScript, Tailwind CSS 3 and React Router 7; TanStack Query and Axios fetch the collection, i18next loads English and Arabic, and Embla runs the carousels.",
      "Filters and the comparison live in the address; one select component serves the search card, the filters, the forms and the comparison picker.",
    ],
  },
  {
    slug: "balcon-studio",
    scope:
      "Built the Balcon Studio landing page and its six-question estimate, from the first choice to a checked brief and the contact details the studio needs to call back.",
    features: [
      {
        title: "A six-question brief",
        points: [
          "Visitors choose the kind of premises, its area, an interior style from photographs, when to start, the state of the property and what matters most to them in design.",
          "The area can be typed or set on a slider, and must be a whole number from 10 to 10,000 m².",
          "Going back keeps every answer, and progress is kept for the browser tab, so a refresh does not restart the questionnaire.",
        ],
      },
      {
        title: "Checking before sending",
        points: [
          "After the last question the brief lists every answer, each with a Change link that opens the question and then returns to the brief.",
          "The contact form asks for a name, phone, email, contact method and language, with a label on every field and a message under any that needs fixing. Phones are checked for the chosen country.",
          "Once sent, the page thanks the visitor by name and repeats how they will be contacted, the style of the catalog they will receive and the date their 5% discount ends.",
        ],
      },
      {
        title: "The landing page",
        points: [
          "The home page lists what the estimate gives (a cost calculation, a catalog in the visitor's style and a discount) and starts the questionnaire.",
          "Order a call checks the number and confirms on the page. The Instagram, Telegram and WhatsApp links come from the build settings and are hidden when they are not set.",
          "On phones the photograph sits above the offer instead of beside it.",
        ],
      },
    ],
    decisions: [
      {
        title: "Questions as data",
        detail:
          "The six questions, their answers and the short labels used in the brief live in one list, and one card renders whichever step is current, so adding or reordering a question is a change to the list.",
      },
      {
        title: "Answers keyed by question number",
        detail:
          "Answers are kept in the questionnaire's state by question number, and each step reads its selected answer from there. That is why Back and Change show the earlier choice instead of an empty step.",
      },
      {
        title: "Usable from the keyboard",
        detail:
          "Every answer is a real radio button in a fieldset, visually hidden behind its styled card, so Tab and the arrow keys work. Each new step moves focus to its question.",
      },
      {
        title: "A static site with one place to send from",
        detail:
          "The site is exported as static pages. Sending the brief sits in a single function where the studio's own service connects.",
      },
    ],
    title: "Balcon Studio",
    category: "landing-pages",
    summary:
      "A design-studio landing page with a six-question project estimate that ends in a checked brief and a contact form.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "daisyUI",
      "React Hook Form",
      "react-phone-number-input",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/balcon-studio/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Balcon Studio home page with an interior photograph beside the estimate offer and the Start estimating button, shown with sample data.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/balcon-studio/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio home page with an interior photograph, the estimate offer, Order a call and social links, shown with sample data.",
        caption: "Home page.",
      },
      {
        src: "/projects/balcon-studio/screens/02-quiz-property.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio questionnaire, first question, with Villa chosen from six kinds of premises, shown with sample data.",
        caption: "Question 1, the kind of premises.",
      },
      {
        src: "/projects/balcon-studio/screens/03-quiz-area.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio area question with 140 m² typed and the slider at the same value, shown with sample data.",
        caption: "Question 2, the area, typed or on a slider.",
      },
      {
        src: "/projects/balcon-studio/screens/04-quiz-style.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio style question with six interior photographs and Neoclassical chosen, shown with sample data.",
        caption: "Question 3, the interior style.",
      },
      {
        src: "/projects/balcon-studio/screens/05-quiz-condition.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio question on the state of the property with Secondary housing chosen, shown with sample data.",
        caption: "Question 5, the state of the property.",
      },
      {
        src: "/projects/balcon-studio/screens/06-brief-review.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio brief listing the six answers, each with a Change link, shown with sample data.",
        caption: "The brief, checked before sending.",
      },
      {
        src: "/projects/balcon-studio/screens/07-contact-errors.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio contact form with messages under the phone, email and contact method fields, shown with sample data.",
        caption: "Contact form with field messages.",
      },
      {
        src: "/projects/balcon-studio/screens/08-contact-filled.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Balcon Studio contact form filled in, with WhatsApp as the contact method and English as the language, shown with sample data.",
        caption: "Contact form, filled in.",
      },
      {
        src: "/projects/balcon-studio/screens/09-submitted.png",
        width: 2880,
        height: 2042,
        kind: "capture",
        alt: "Capture of the Balcon Studio confirmation thanking the visitor by name, with how they will be contacted, the catalog style, the date the discount ends and the brief, shown with sample data.",
        caption: "Confirmation after sending.",
      },
      {
        src: "/projects/balcon-studio/screens/10-phone-home.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Balcon Studio home page on a phone, with the photograph above the estimate offer and Order a call, shown with sample data.",
        caption: "Home page on a phone.",
      },
    ],
    context: [
      "Balcon Studio designs interiors. The site turns a visit into a project brief: six questions about the premises and the visitor's taste, then their contact details.",
      "Pages: home, and the questionnaire with its brief, contact form and confirmation. The logo in the interface reads BALCONY Dubai.",
    ],
    role: ["Solo front-end developer, April 2024."],
    approach: [
      "Next.js 14 (App Router) with React 18, TypeScript, Tailwind CSS 3 and daisyUI, exported as static pages.",
      "The contact form uses React Hook Form. Phone numbers use react-phone-number-input with its flags bundled, so no request goes to another site.",
    ],
  },
  {
    slug: "expat-shop",
    scope:
      "Built the ExpatShop storefront from the client's desktop and mobile Figma files, then made its 14 static pages work as a shop in the browser: catalogue, cart, checkout and orders.",
    features: [
      {
        title: "Finding products",
        points: [
          "Categories in the menu, a category strip on the home page and a products-from-the-world grid open a filtered list with a count, sorting by price or name and an empty state.",
          "Header search looks through names, descriptions, categories and countries; new products and offers have their own lists.",
          "Each product has a details page with quantity and related products from the same category.",
        ],
      },
      {
        title: "Cart and prices",
        points: [
          "Add to cart from any card with a quantity; the header badge, the mini cart and a short confirmation update straight away.",
          "The cart page changes quantities and removes lines, with totals in soles and dollars.",
          "A currency switch (USD or PEN) is remembered and applied to every product price.",
        ],
      },
      {
        title: "Checkout",
        points: [
          "Before checkout a visitor signs in, creates an account or continues as a guest, with names, Peruvian mobile numbers, email and passwords checked field by field.",
          "Addresses are saved with a type, a street of up to 85 characters and a Lima district, and open in Google Maps from a link.",
          "The order can be paid in soles or dollars, by card, Yape or mobile banking, with RUC details for a receipt; anything missing is listed before the order is placed.",
        ],
      },
      {
        title: "After the order",
        points: [
          "Order status shows the total, payment state and the products, and the orders page lists every order with a link to it.",
          "Saved addresses can be removed after a confirmation, and the referral page copies the customer's link.",
        ],
      },
    ],
    decisions: [
      {
        title: "One script over the designed pages",
        detail:
          "The HTML and CSS stay as built from the Figma files. One script reads which page it is on and fills the existing markup from a single sample catalogue, before the original script starts the carousels.",
      },
      {
        title: "State kept in the browser",
        detail:
          "The cart, currency, saved addresses and orders are kept in local storage, with an in-memory fallback when storage is blocked, so every page agrees without a server.",
      },
      {
        title: "Dollars first, soles from one rate",
        detail:
          "Prices are stored in dollars and converted to soles with one rate, so cart, checkout and order totals always match in both currencies.",
      },
      {
        title: "No requests to other sites",
        detail:
          "The fonts are served with the site and the embedded map became a link, so a page loads nothing from third parties until the visitor follows a link.",
      },
    ],
    title: "Expat Shop",
    category: "e-commerce",
    summary:
      "An online shop for products from around the world, sold in Peru: catalogue, cart in soles and dollars, checkout and orders, built from Figma designs.",
    builtWith: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap", "Slick", "Font Awesome"],
    period: "2023",
    progress: "completed",
    image: {
      src: "/projects/expat-shop/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Expat Shop home page with the header, category menu, hero photograph and a strip of product categories, shown with sample data.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/expat-shop/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop home page with the search bar, currency and language switches, category menu and category strip, shown with sample data.",
        caption: "Home page.",
      },
      {
        src: "/projects/expat-shop/screens/02-world.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop products-from-the-world grid with a tile and product count for each of ten countries, shown with sample data.",
        caption: "Products from the world, by country.",
      },
      {
        src: "/projects/expat-shop/screens/03-offers.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop offers list with four discounted products, a count and a sort menu, shown with sample data.",
        caption: "Offers and discounts.",
      },
      {
        src: "/projects/expat-shop/screens/04-product-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an Expat Shop product page with the price, description, category and quantity, and a confirmation that the product was added to the cart, shown with sample data.",
        caption: "Product details, added to the cart.",
      },
      {
        src: "/projects/expat-shop/screens/05-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop cart with three products, quantity buttons and prices in soles and dollars, shown with sample data.",
        caption: "Cart in soles and dollars.",
      },
      {
        src: "/projects/expat-shop/screens/06-guest-checks.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop guest form flagging a mobile number that is too short and missing fields, shown with sample data.",
        caption: "Guest details, checked before checkout.",
      },
      {
        src: "/projects/expat-shop/screens/07-checkout.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop checkout with a saved Miraflores address and the order summary from the cart, shown with sample data.",
        caption: "Checkout with a saved address.",
      },
      {
        src: "/projects/expat-shop/screens/08-order-status.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop order status with the total, payment state and a choice to pay in soles or dollars, shown with sample data.",
        caption: "Order status after checkout.",
      },
      {
        src: "/projects/expat-shop/screens/09-orders.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Expat Shop orders page listing an order with its date, payment state and total, shown with sample data.",
        caption: "My orders.",
      },
      {
        src: "/projects/expat-shop/screens/10-phone-products.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Expat Shop oils list on a phone with a product card and an added-to-cart confirmation, shown with sample data.",
        caption: "Products on a phone.",
      },
    ],
    context: [
      "ExpatShop sells products from around the world to customers in Peru, with prices in dollars and soles.",
      "Pages (14): home, products, product details, recommendations, cart, checkout choice, sign-in, sign-up, guest details, checkout, order status, orders, saved addresses and referral program.",
    ],
    role: [
      "Front-end developer: built the pages from the client's desktop and mobile Figma files. File dates run from October to November 2023; the folder had no git history.",
    ],
    approach: [
      "Static HTML and CSS on Bootstrap 3, with jQuery, Slick carousels and Font Awesome icons, and separate phone layouts from the mobile Figma file.",
      "Shop behaviour lives in one script over a sample catalogue, with fonts served from the site.",
    ],
  },
  {
    slug: "hemex-landing-page",
    scope:
      "Built the Hemex Academy site in English and Arabic: a home page and a four-step parent registration with email or mobile, a verification code, contact preferences and locations.",
    features: [
      {
        title: "Home page",
        points: [
          "A hero built from the academy's own description, the four registration steps and a closing call to register, with a header that links to each section.",
          "Locations come from the API: online classes and each branch with a map link; the section is hidden when none load.",
        ],
      },
      {
        title: "Registration in four steps",
        points: [
          "Register with an email address or a mobile number; the service's answer, such as an address already registered, is shown under the field.",
          "The code step names where the code went, accepts paste and the phone's code autofill, clears a wrong code with the reason, and offers a new code after 60 seconds.",
          "Contact channels and locations come from the API; the registered email or number fills the matching channel, and every value is checked as it is typed.",
          "The last step sends the chosen channel and location ids; a summary then shows what was saved, where the sign-in details go and a link to the parent portal.",
        ],
      },
      {
        title: "English and Arabic, any screen",
        points: [
          "Every page in both languages, Arabic right to left, with a language switch that keeps the visitor on the same step with the same choices.",
          "On phones the step labels become one line, and every field has a label and its own error message.",
        ],
      },
    ],
    decisions: [
      {
        title: "Choices kept by the form",
        detail:
          "The steps were separate components with their own state, so going Back lost the ticked channels and locations while the old ones were still submitted. The form now owns every choice, and each step only shows and changes it.",
      },
      {
        title: "A code verifies one contact",
        detail:
          "Verification is stored against the email or number the code was sent to, so changing the contact after verifying asks for a new code, and going back to the first step does not register the same contact twice.",
      },
      {
        title: "Progress kept for the tab",
        detail:
          "The step and the choices are kept in session storage, so a refresh or a language switch continues where the visitor was. The code digits are never stored, and the saved progress is cleared once registration completes.",
      },
      {
        title: "Lists rendered on the server",
        detail:
          "Channels and locations are rendered on the server and refreshed every five minutes instead of fetched on every visit, and a step whose list could not be loaded says so instead of failing.",
      },
    ],
    title: "Hemex landing page",
    category: "landing-pages",
    summary:
      "The public site of a children's coding academy in Egypt: a home page and a four-step parent registration, in English and Arabic.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "daisyUI",
      "next-intl",
      "React Toastify",
      "React Icons",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/hemex-landing-page/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Hemex home page hero with the HEMEX mark, the academy's description and the Register now button, shown with sample data.",
      caption: "Home page.",
    },
    screens: [
      {
        src: "/projects/hemex-landing-page/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex home page hero with the academy's description, the Register now and How registration works buttons and three key points, shown with sample data.",
        caption: "Home page.",
      },
      {
        src: "/projects/hemex-landing-page/screens/02-steps-and-locations.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex home page sections on the four registration steps and the locations, online classes and three branches with map links, shown with sample data.",
        caption: "Registration steps and locations.",
      },
      {
        src: "/projects/hemex-landing-page/screens/03-register-email.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex registration first step with the Email and Mobile tabs and an email address entered, next to a panel describing the four steps, shown with sample data.",
        caption: "Step 1, email or mobile.",
      },
      {
        src: "/projects/hemex-landing-page/screens/04-code-verification.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex code step after a wrong code, with the address the code went to, cleared boxes, the error and the countdown before a new code, shown with sample data.",
        caption: "Wrong verification code.",
      },
      {
        src: "/projects/hemex-landing-page/screens/05-preferences.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex preferences step with WhatsApp and Email chosen and their values filled in, shown with sample data.",
        caption: "Contact preferences.",
      },
      {
        src: "/projects/hemex-landing-page/screens/06-location.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex location step with Online and Maadi chosen and map links for the branches, shown with sample data.",
        caption: "Preferred locations.",
      },
      {
        src: "/projects/hemex-landing-page/screens/07-registered.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex summary after registration with the email, channels and locations, what happens next and a parent portal button, shown with sample data.",
        caption: "Registration complete.",
      },
      {
        src: "/projects/hemex-landing-page/screens/08-arabic-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex home page in Arabic, right to left, with the hero, buttons and key points, shown with sample data.",
        caption: "Home page in Arabic.",
      },
      {
        src: "/projects/hemex-landing-page/screens/09-arabic-preferences.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex preferences step in Arabic, right to left, where the registered mobile number fills WhatsApp, shown with sample data.",
        caption: "Contact preferences in Arabic.",
      },
      {
        src: "/projects/hemex-landing-page/screens/10-phone-code.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Hemex code step on a phone, with the one-line step indicator and three digits entered, shown with sample data.",
        caption: "Code step on a phone.",
      },
    ],
    context: [
      "Hemex is a coding academy for children and young people in Egypt. This is its public site: a home page and the registration that creates a parent's account before the parent portal takes over.",
      "Pages: home and register, each in English and Arabic.",
    ],
    role: [
      "Front-end developer: built the site from December 2024 to February 2025, and added the home page, the Arabic version and the connected last step later in a second pass on the same code.",
    ],
    approach: [
      "Next.js 15 App Router with React 19 and TypeScript, Tailwind CSS with daisyUI in the academy's purple and yellow, and next-intl for routing and messages in English and Arabic.",
      "API calls live in small typed helpers, and each registration step has a hook for its request, errors and state.",
    ],
  },
];
