import type { ProductProject } from "@/lib/projects/types";

/**
 * Production projects: SaaS products, dashboards and business applications.
 * Every image is a real capture of the project's own interface rendered with sample data.
 * Case-study text comes from the project's code and the CV; no metric appears unless the CV states it.
 */
export const digitalProductsProjects: readonly ProductProject[] = [
  {
    slug: "toolswift-customer-dashboard",
    scope:
      "Built the B2B customer portal front end: shopping by company and store, checkout on credit or card, quotes, orders, invoices and statements, document signing and a phone layout.",
    features: [
      {
        title: "Buying for a company",
        points: [
          "The company and the store location are chosen in the top bar; prices, stock and the cart follow that choice.",
          "Product pages show the stock at each store location and let the buyer choose pickup or delivery for each item.",
          "The cart groups items by how they will arrive, and an order can be linked to one of the company's jobs.",
          "Contract catalogues, saved lists, and reordering any past order in one step.",
        ],
      },
      {
        title: "Checkout and paying",
        points: [
          "Checkout runs in three steps: contact and job, fulfilment with the delivery address, then payment.",
          "Delivery and sales tax are calculated for the chosen address and fulfilment methods before the order is placed.",
          "A company with credit can pay on account; the payment step shows its standing, available credit and credit used.",
          "Card payments use the store's own gateway: Stripe, Moneris, Clover or Versapay.",
        ],
      },
      {
        title: "Quotes, orders and invoices",
        points: [
          "Buyers request quotes and order a received quote; when the cart already has items, they confirm before it is replaced.",
          "Orders, quotes and documents have status tabs with counts, search, filters and an expanded table view.",
          "Invoices and monthly statements sit together; Pay Due Invoices applies a payment to the oldest invoices first and previews the result.",
        ],
      },
      {
        title: "Documents and the company",
        points: [
          "A documents inbox for signature requests, where a buyer signs by drawing or typing, or declines with a reason.",
          "The company's profile, addresses, users and jobs, managed by the company's managers.",
        ],
      },
      {
        title: "On a phone",
        points: [
          "Phones get an app-like layout with bottom tabs and a More menu and the same features as the desktop; tables become cards.",
          "The portal can be installed to a phone or desktop home screen.",
        ],
      },
    ],
    decisions: [
      {
        title: "One codebase, many stores",
        detail:
          "Each store is a configuration with its colours, fonts, logos and install manifest, chosen at build time by a client id. Eleven stores are configured besides the default, so a new store does not need a fork.",
      },
      {
        title: "The cart belongs to the company",
        detail:
          "The cart query is keyed by the selected company, so switching companies never shows another company's cart. Cart changes are optimistic: the cache updates at once and rolls back if the request fails, and one shared flag stops several components repeating the same error.",
      },
      {
        title: "Installable, never stale",
        detail:
          "The installable app precaches only static files. API calls always go to the network and pages are never cached, so a stale screen or another store's data is never served.",
      },
      {
        title: "Sessions that end cleanly",
        detail:
          "An expired token is dropped before a request is sent. When the API answers 401, the buyer is signed out, document-signing and moderation sessions are cleared, and login returns them to the page they were on.",
      },
    ],
    title: "ToolSwift customer dashboard",
    category: "dashboards",
    summary:
      "A B2B customer portal where company buyers shop with their prices and stock, pay on credit or card, and manage quotes, orders, invoices and signed documents.",
    builtWith: [
      "React",
      "TypeScript",
      "Vite",
      "TanStack Router",
      "TanStack Query",
      "Zustand",
      "MUI X",
      "React Hook Form",
      "Zod",
      "Stripe",
      "Socket.IO",
      "Playwright",
    ],
    period: "2025",
    progress: "in-progress",
    image: {
      src: "/projects/toolswift-customer-dashboard/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the ToolSwift customer portal overview: the company's credit limit and balances, invoices and statements with Pay Now, and new arrivals.",
      caption: "Overview.",
    },
    productContext: [
      "ToolSwift is a headless commerce platform: a merchant admin, storefronts and B2B customer portals. The customer dashboard is the portal where a company's buyers shop, check out, follow quotes and orders, pay invoices and sign documents.",
      "One codebase serves several stores. Each store is a configuration (theme colours, fonts, logos, install manifest) selected at build time by a client id; eleven are configured besides the default.",
    ],
    usersAndProblems: [
      "Buyers at contracting and supply companies often work for several companies and from several store locations. The portal keeps each company's cart, prices and documents apart, and shows stock and fulfilment options for the chosen store.",
      "Their work is reordering, comparing quotes, paying on account and keeping up with invoices, so the interface favours dense tables, status tabs and quick actions, and the same work has to be possible from a phone on site.",
    ],
    workflows: [
      "Shop and cart: catalogue, contract catalogues and product pages with stock by location, pickup or delivery per item, saved lists, and a three-step checkout that ends on credit or the store's card gateway.",
      "Quotes, orders and money: quote requests and ordering a received quote, order tracking and reordering, invoices and monthly statements, Pay Now on one invoice and Pay Due Invoices across them.",
      "Company and documents: company profile, addresses, users and jobs; a signature inbox; real-time notifications and chat over Socket.IO; and a terms gate on first login.",
    ],
    designDecisions: [
      "Server state lives in TanStack Query; client state (selected company, store address, session, interface) in small Zustand stores. Routing uses TanStack Router with automatic code splitting, so each route is its own chunk.",
      "Quality gates: TypeScript, ESLint, Husky and commitlint, 143 unit and component test files and 28 Playwright end-to-end specs. Sentry reports errors.",
    ],
    role: [
      "Front-end developer: built the customer portal from August 2025, from the shop and checkout to quotes, invoices and statements, documents, the company pages and the phone layout.",
    ],
    outcomes: [
      "API calls reduced by about 70% through debounced cart operations, optimised caching and optimistic UI updates; lazy loading, parallel data fetching and infinite scrolling applied to high-traffic modules.",
    ],
    screens: [
      {
        src: "/projects/toolswift-customer-dashboard/screens/01-overview.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the customer portal overview for Northline Contracting: credit limit, available credit and balances, invoices and statements with Pay Now, and new arrivals.",
        caption: "Overview.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/02-shop.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the shop: filters by category, brand and price, a search field, and product cards with savings, stock, unit prices and In Cart counts.",
        caption: "Shop.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/03-product-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a product page for a cordless drill driver: specifications, the price and saving, stock at two store locations, pickup or delivery, and a delivery estimate.",
        caption: "Product page.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/04-cart.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the cart: items grouped for delivery, each with quantity and a pickup or delivery choice, and a payment summary with the discount.",
        caption: "Cart.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/05-checkout-credit.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of checkout at the payment step: Credit Balance chosen, showing good standing, available credit, credit limit and credit used, next to the order total with delivery and tax.",
        caption: "Checkout on credit.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/06-quote-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a received quote: company, job, PO number and sales rep, the delivery address and preferred date, the quote summary, and Order Now.",
        caption: "Quote details.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/07-order-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an order out for delivery and paid: its status, the products in the package and the order summary with delivery and taxes.",
        caption: "Order details.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/08-pay-due-invoices.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Settle your balance: a payment of 2,000 dollars applied to the oldest invoices first, two fully paid and one partly, with the totals before and after.",
        caption: "Pay due invoices.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/09-documents.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the documents inbox: quotes, agreements and order terms with their signature status and the buyer's own status.",
        caption: "Documents to sign.",
      },
      {
        src: "/projects/toolswift-customer-dashboard/screens/10-phone-orders.png",
        width: 780,
        height: 1688,
        kind: "capture",
        view: "phone",
        alt: "Capture of the orders list on a phone: status tabs, orders as cards with job, store, dates and payment, Reorder, and the bottom tabs.",
        caption: "Orders on a phone.",
      },
    ],
  },
  {
    slug: "toolswift-admin-platform",
    scope:
      "Built the merchant admin's quotes, products, orders, payments, companies, messages and store settings, including the shared product picker and saved table layouts.",
    features: [
      {
        title: "Quotes",
        points: [
          "Staff build a quote for a customer at a store location, picking products and quantities in a category browser that shows stock, cost and retail price.",
          "Unit prices can be changed per line, custom items added, and terms edited for one quote; the buyer has to accept them before approving.",
          "A quote goes out by email or SMS, with automatic reminders on the due date or days before it.",
        ],
      },
      {
        title: "Orders and payments",
        points: [
          "Orders have status tabs with counts, chosen columns, and bulk status changes or deletion for the selected rows.",
          "Invoices show what is outstanding, collected and overdue, and how many customers are on each credit term.",
          "A payment received on its own can be assigned to one or more invoices.",
        ],
      },
      {
        title: "Catalogue and customers",
        points: [
          "The product editor covers general details, variations with their own images and fulfilment methods, pricing and inventory.",
          "Company pages hold addresses, members with manager roles, orders, credit and the available balance.",
        ],
      },
      {
        title: "Messages and the store",
        points: [
          "An inbox for customer chats, pinned threads, and SMS once the store has set it up.",
          "Store settings for email branding and SMTP, payment and shipping policies, and return policies with a restocking fee.",
          "Google Merchant Center sync, which has to be activated first and lists the products Google rejected.",
        ],
      },
    ],
    decisions: [
      {
        title: "One product picker",
        detail:
          "The product browser (categories, search, stock, cost and retail price, a quantity per variant) is one shared component. Quotes, new orders, catalogues, bundles and the refund and shipping rules all use it, with variants listed under their product.",
      },
      {
        title: "Quote totals from the store",
        detail:
          "The quote builder sends its lines to the same price calculation the customer portal uses, so discounts and tax match what the buyer will see.",
      },
      {
        title: "Tables open as they were left",
        detail:
          "Tables keep each user's visible, pinned and resized columns, so a list opens the way staff left it.",
      },
      {
        title: "SMS only where it works",
        detail:
          "Sending by SMS, in quotes and in messages, is offered only when the store has SMS set up; otherwise the option shows a link to set it up instead of failing on send.",
      },
    ],
    title: "ToolSwift admin platform",
    category: "saas-products",
    summary:
      "The merchant admin for ToolSwift: quotes, orders and invoices, the product catalogue, companies and their credit, customer messages and store settings.",
    builtWith: [
      "React",
      "Vite",
      "React Router",
      "Redux Toolkit",
      "RTK Query",
      "MUI",
      "MUI X",
      "React Hook Form",
      "Zod",
      "Chart.js",
      "Socket.IO",
      "Sentry",
    ],
    period: "2025",
    progress: "in-progress",
    image: {
      src: "/projects/toolswift-admin-platform/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the ToolSwift admin dashboard: net sales with monthly bars and sales by store location, order and quote counts, and top-selling products.",
      caption: "Dashboard.",
    },
    productContext: [
      "The admin platform is the back office of the ToolSwift commerce platform: merchants manage quotes, orders and invoices, products and inventory, companies and customers, discounts, content and integrations from one interface.",
      "It is a React single-page app built with Vite, using React Router, Redux Toolkit with RTK Query, MUI with the MUI X data grid, Chart.js and Socket.IO.",
    ],
    usersAndProblems: [
      "Store staff answer buyers who ask for prices, so a quote has to be quick to build from the catalogue, priced the way the store prices orders, and easy for the buyer to accept.",
      "The same staff follow orders, invoices and credit across many companies, so every list shares the same tabs, filters, columns and bulk actions.",
    ],
    workflows: [
      "Quotes: build, price and send by email or SMS with reminders; change status; follow a quote to the order it became.",
      "Orders and money: status tabs and bulk changes, invoices and payments, payments assigned to invoices, company credit.",
      "Catalogue, customers and store: products and variations, categories and catalogues, companies and members, messages, policies, email and Google Merchant Center.",
    ],
    designDecisions: [
      "RTK Query services are split per area (44 API modules, from orders and quotes to catalogues, documents and integrations) on one base query that adds the session and store key and signs the user out on an expired session.",
    ],
    role: [
      "Front-end developer on the admin team since February 2025: products, quotes, store settings, messages, orders, payments and companies.",
    ],
    screens: [
      {
        src: "/projects/toolswift-admin-platform/screens/01-dashboard.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the admin dashboard: net sales with monthly bars, sales by store location, counts of orders, quotes, payments and shipments, top-selling products and the latest orders.",
        caption: "Dashboard.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/02-orders.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the orders list with status tabs and counts, two orders selected and a bar offering Change Status and Delete Orders.",
        caption: "Orders with bulk actions.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/03-quote-product-picker.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the product browser while building a quote: categories on the left, products with stock, cost and retail price, three variants selected with quantities.",
        caption: "Picking products for a quote.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/04-quote-builder.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Create a Quote: the store location, the customer with contact and shipping address, and three tools with editable unit prices and line totals.",
        caption: "Quote builder.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/05-quote-terms-reminders.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the lower part of the quote: terms for this quote, the payment summary with item discounts, sending by email and reminders two days before the due date.",
        caption: "Quote terms, totals and reminders.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/06-quote-send.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a pending quote's details with the Send To Customer menu open: Send Via Email and Set Up SMS.",
        caption: "Sending a quote.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/07-edit-product.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Edit Product for a cordless drill: tabs for general details, variations, pricing and inventory, the thumbnail, status, name, category and description.",
        caption: "Product editor.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/08-invoices.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of invoices: outstanding, collected and overdue totals, customers per credit term, status tabs, and invoices by customer and company.",
        caption: "Invoices.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/09-company.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a company's details: contact, billing and site addresses, total spent, orders, quote requests, available credit and good standing.",
        caption: "Company details.",
      },
      {
        src: "/projects/toolswift-admin-platform/screens/10-messages.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the messages inbox: customer chats with unread counts and an open conversation about a delivery time and a new quote.",
        caption: "Customer messages.",
      },
    ],
  },
  {
    slug: "smooth-erp",
    scope:
      "Led the front end of a multi-company ERP: point of sale, accounting, inventory, sales, projects and the access system behind them, plus the admin that runs client companies.",
    features: [
      {
        title: "Point of sale",
        points: [
          "Cashiers open and close sessions; each session has its own sale, purchase and return screens with a product grid by category.",
          "Barcode and QR scanning add items, and a sale ends with Payment and Print on a receipt that follows the company's print theme.",
          "The point of sale is installable and detects lost connectivity, so a shop keeps working when the network drops.",
          "Each shop has a dashboard: balance today, profit, stock value, cash and credit sales and purchases, vouchers and receivables, over monthly charts.",
        ],
      },
      {
        title: "Accounting",
        points: [
          "A chart of accounts and cost centres as expandable trees, with main and sub accounts.",
          "Journal and opening entries, cheques, notes payable and receivable, treasuries, taxes, and detailed or total account statements.",
          "Final accounts: profit and loss, balance sheet, cash flow and an executive summary, printable.",
        ],
      },
      {
        title: "Inventory, sales and purchases",
        points: [
          "Stores, items, units of measure, manufacturers, opening balances and printed barcode labels.",
          "Cash and credit sales and purchase bills with returns, discounts and tax, payments, and customer and supplier statements.",
          "Transfers between stores, materials requests, item movement, store balances and profit per item.",
        ],
      },
      {
        title: "Projects, factories and equipment",
        points: [
          "Projects split into partitions, with workers, daily pay, expenses, custody, financial summaries and profit distribution.",
          "Factory items with manufacturing permissions, and equipment with its daily use and expenses.",
        ],
      },
      {
        title: "Companies, access and subscriptions",
        points: [
          "Every company works on its own subdomain; users and groups get create, read, update and delete rights per table.",
          "Deleted bills, entries and users go to a recycle bin; data can be imported; plans are chosen and paid for in the app.",
          "A separate platform admin manages the client companies: their branches, user and point-of-sale limits, subdomains and expiry dates.",
        ],
      },
      {
        title: "Finding your way in 300 screens",
        points: [
          "Ctrl or Cmd + K opens a search over the pages the user may open, in Arabic or English, with recently visited pages first.",
          "Each module opens on a home page that lists its sections and pages, so nobody lands on an empty screen.",
          "The whole interface runs in Arabic, right to left, or English, and a user can switch at any time.",
        ],
      },
    ],
    decisions: [
      {
        title: "Tenancy and access at the edge",
        detail:
          "Middleware resolves the company from the subdomain and checks it before anything renders, sends anyone without a session to the login page, and each route is mapped to a table and an action, so a page cannot be opened without that permission.",
      },
      {
        title: "Menus built from permissions",
        detail:
          "Each module's navbar is built from permission-checked items. The page search and the module home pages reuse exactly those items, so they never show a page the user cannot open and add no extra requests.",
      },
      {
        title: "Server data, client interaction",
        detail:
          "Screens are split into server containers that load data and permissions and client containers that handle input, with shared table, form and print building blocks reused across the modules.",
      },
      {
        title: "Invoice rows keyed by item and unit",
        detail:
          "Invoice row keys combine the item ID and unit-price ID. Adding the same item and unit again raises the quantity on the existing row, while a different unit of the same item gets its own row.",
      },
      {
        title: "Arabic first",
        detail:
          "Routes are localised with next-intl and Arabic is the default locale, so layouts, tables, trees and reports are built to work right to left first, not mirrored afterwards.",
      },
      {
        title: "Heavy parts on demand",
        detail:
          "Charts, scanners and print views load only when used, through dynamic imports, which keeps the first load of a module light.",
      },
    ],
    title: "Smooth ERP",
    category: "saas-products",
    summary:
      "A multi-company ERP in Arabic and English: point of sale, accounting, inventory, sales, purchases and projects, with access set per screen and action.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Ant Design",
      "next-intl",
      "Recoil",
      "React Hook Form",
      "Joi",
      "next-pwa",
      "Google Charts",
      "Playwright",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/smooth-erp/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Smooth ERP point of sale dashboard: summary cards above monthly charts, with sample data.",
      caption: "Real interface rendered from the project's code with sample data.",
    },
    productContext: [
      "Smooth ERP is an ERP sold to companies by subscription. Each company works on its own subdomain and turns on the modules it needs: point of sale, accounting, inventory, sales, purchases, projects, factories and equipment, plus settings for users, permissions and printing.",
      "The front end is Next.js (App Router) with TypeScript, Tailwind CSS, Ant Design and next-intl, in Arabic (the default, right to left) and English. A separate Next.js admin manages the client companies themselves.",
    ],
    usersAndProblems: [
      "Shops need a point of sale that is fast at the counter and keeps working when the connection drops; accountants need full books and reports; owners need to see the business at a glance; and administrators need to decide exactly who can see or change what, across more than 300 screens.",
    ],
    workflows: [
      "A day in a shop: the cashier opens a session, sells by scanning or tapping products, prints receipts, records expenses and closes the session, and the owner follows sales, profit and stock on the shop dashboard. Behind it, bills post to the accounts, and the final accounts are always one click away.",
    ],
    designDecisions: [
      "The ERP is one app with nine modules that share one shell, one permission model and one set of table, form and print components, so a new screen in any module behaves like the rest.",
    ],
    role: [
      "Led front-end development on the team from April 2024 to January 2025, and built the platform admin that runs client companies.",
    ],
    outcomes: [
      "Reduced the initial bundle and improved load times with dynamic imports and lazy loading, and delivered an offline-ready point of sale as a PWA.",
    ],
    screens: [
      {
        src: "/projects/smooth-erp/screens/01-module-home.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP home screen with the company's modules as tiles, shown with sample data.",
        caption: "Home: the modules a company subscribes to.",
      },
      {
        src: "/projects/smooth-erp/screens/02-accounting-home.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP accounting home page listing its sections and pages, shown with sample data.",
        caption: "Accounting home: every section and page in one place.",
      },
      {
        src: "/projects/smooth-erp/screens/03-page-search-ar.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP page search in Arabic, right to left, finding the journal entry pages, shown with sample data.",
        caption: "Page search in Arabic (Ctrl or Cmd + K).",
      },
      {
        src: "/projects/smooth-erp/screens/04-pos-dashboard.png",
        width: 2880,
        height: 2580,
        kind: "capture",
        alt: "Capture of a Smooth ERP shop dashboard: summary cards for balance, profit, stock, sales and purchases above monthly charts, shown with sample data.",
        caption: "Shop dashboard.",
      },
      {
        src: "/projects/smooth-erp/screens/05-pos-checkout.png",
        width: 1920,
        height: 1080,
        kind: "capture",
        alt: "Capture of the Smooth ERP point-of-sale checkout screen, shown with sample data.",
        caption: "Point-of-sale checkout.",
      },
      {
        src: "/projects/smooth-erp/screens/06-sales-bills.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP sales bills table with discount, tax, paid and remaining amounts, shown with sample data.",
        caption: "Sales bills.",
      },
      {
        src: "/projects/smooth-erp/screens/07-account-tree.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP chart of accounts tree with assets and liabilities expanded, shown with sample data.",
        caption: "Chart of accounts.",
      },
      {
        src: "/projects/smooth-erp/screens/08-profit-loss-ar.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP profit and loss report in Arabic, ending with net profit, shown with sample data.",
        caption: "Profit and loss in Arabic.",
      },
      {
        src: "/projects/smooth-erp/screens/09-platform-clients.png",
        width: 2880,
        height: 1800,
        kind: "capture",
        alt: "Capture of the Smooth ERP platform admin listing client companies, one expanded to its branches, limits and subdomains, shown with sample data.",
        caption: "Platform admin: client companies and their branches.",
      },
    ],
  },
  {
    slug: "camufacturing-dashboard",
    scope:
      "Built the license-management dashboard from its first commit: the license grid, create and edit forms, bulk import with chunked uploads and live progress, notifications, users and roles, settings and sign-in.",
    features: [
      {
        title: "License grid",
        points: [
          "A server-paged grid of licenses with search, sorting, page and page size kept in the address, and a footer to change how many rows a page shows.",
          "Each license shows its type, level, network, channel, issue and expiry dates, an Active or Expired status and a download button for the license file.",
          "Selecting rows opens the actions: update a single license, or delete several after a confirmation.",
        ],
      },
      {
        title: "Create and edit licenses",
        points: [
          "One form creates or edits a license; the owner is picked from a searchable, paged list of users, or created in the same step.",
          "Type, level and network come from fixed lists, the license number is capped at nine letters and digits, and editing keeps the existing expiry date.",
        ],
      },
      {
        title: "Bulk import and notifications",
        points: [
          "Licenses are imported from a CSV or Excel file by drag and drop, with a sample template to download and a size limit on uploads.",
          "Large files go up in pieces through the app's own upload route, which joins them and passes the file to the API; a progress bar follows the import live and the grid refreshes at the end.",
          "A notification panel lists imports, issued licenses and expiry reminders by day, with mark all as read and clear all.",
        ],
      },
      {
        title: "Users, roles and settings",
        points: [
          "Admins manage users in their own grid: create, edit and delete them, see their role and resend an invitation.",
          "The menu shows the Users page only to admins and super admins, and the role list offers only what the signed-in user may give: a super admin can make admins and users, an admin only users.",
          "Settings cover account details with a photo, the default license duration, expiry reminders and notification switches; sign-in, email verification and password reset complete the app.",
        ],
      },
    ],
    decisions: [
      {
        title: "Live updates instead of polling",
        detail:
          "Import progress and notifications arrive over one SignalR connection. When an import reports completion, the dashboard revalidates the cached license data so the grid shows the new rows, then clears the finished progress bar after a short delay.",
      },
      {
        title: "Forms described as data",
        detail:
          "Each form is a list of field definitions with a Joi schema, rendered by one form component; the same component serves new and edited licenses, a new or existing owner, users and settings.",
      },
    ],
    title: "Camufacturing dashboard",
    category: "dashboards",
    summary:
      "A license-management dashboard for a manufacturing-software vendor: a searchable license grid, bulk import with live progress, notifications and user roles.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "MUI",
      "MUI X DataGrid",
      "NextAuth",
      "React Hook Form",
      "Joi",
      "SignalR",
      "SCSS",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/camufacturing-dashboard/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Camufacturing license grid with search, the new-license and bulk-import buttons and sample licenses.",
      caption: "License grid.",
    },
    productContext: [
      "Camufacturing sells manufacturing simulation software. Its staff keep the license records of customers across several products, each with a type, level, network flag, channel and expiry date.",
      "The dashboard is Next.js 15 with React 19, TypeScript, MUI 7 and the MUI X DataGrid, signs in through NextAuth and talks to the client's API with server actions, plus a SignalR hub for live updates.",
    ],
    usersAndProblems: [
      "Licensing staff need to find a customer's license quickly, see whether it is active, issue or correct a license and load hundreds of existing licenses at once instead of typing them in.",
      "Admins also manage who can use the dashboard, while regular staff only need the licenses.",
    ],
    workflows: [
      "Issue: New License opens the form; staff pick the customer or create one, choose the product type, level, network and dates, and confirm.",
      "Import: Bulk Import takes a CSV or Excel file shaped like the sample template; a progress bar follows the import and a notification reports the result.",
      "Users: an admin adds a user, who receives an invitation; it can be sent again from the users grid.",
    ],
    designDecisions: [
      "Grid state lives in the address, so a filtered, sorted page survives a reload and can be shared.",
      "Status reads in two words: Active in green, Expired in grey.",
      "Small typed building blocks (inputs, selects with paged search, autocomplete, modals, dropzone, password strength) styled with SCSS modules.",
    ],
    role: [
      "Front-end developer: built the dashboard from April to October 2025, from the first commit to users and roles, chunked uploads and the tuned live connection.",
      "Before it, built a first dashboard for the same client in five days (March to April 2025), with customers, course access and a password-strength check; the work then moved to this license dashboard, and that version is not shown.",
    ],
    screens: [
      {
        src: "/projects/camufacturing-dashboard/screens/01-license-grid.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Camufacturing license grid with search, the new-license and bulk-import buttons and ten sample licenses.",
        caption: "License grid.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/02-license-actions.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the license grid scrolled to status, channel, dates and download, with one row selected and its actions menu open.",
        caption: "Status, downloads and row actions.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/03-edit-license.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the edit-license dialog over the grid, with the owner, license number, type, level, network and channel of a sample license.",
        caption: "Edit license.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/04-new-license.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the new-license dialog with the user picker, an add-new-user button and the empty license fields.",
        caption: "New license.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/05-bulk-import.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the bulk-import dialog with the sample-template button and a live progress bar for a running import.",
        caption: "Bulk import with live progress.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/06-notifications.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the notification panel listing an import result and expiry reminders by day, with mark all as read.",
        caption: "Notifications.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/07-users.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the users grid with role badges and a resend-invitation button on each row.",
        caption: "Users and roles.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/08-new-user.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the new-user dialog filled with invented details.",
        caption: "New user.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/09-settings.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the settings page: account details, the default license duration, expiry reminders and notification switches.",
        caption: "Settings.",
      },
      {
        src: "/projects/camufacturing-dashboard/screens/10-login.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the sign-in page with the email and password fields.",
        caption: "Sign-in page.",
      },
    ],
  },
  {
    slug: "hemex-dashboards",
    scope:
      "Built the Hemex instructor dashboard and parent portal: sessions, attendance, availability and profiles for instructors; students, booking and an English and Arabic checkout for parents.",
    features: [
      {
        title: "The instructor's week at a glance",
        points: [
          "The overview shows the next session with its round, time and students, this month's sessions and hours taught, and the running rounds, all from the instructor's own sessions.",
          "A chart of hours taught per month, round progress, the coming week and the past sessions that still need attendance or feedback, each one click from the session.",
        ],
      },
      {
        title: "Rounds, sessions and attendance",
        points: [
          "Rounds open into their own sessions with schedule and progress; sessions filter by status, name and day, sort by date or duration, and page through the API.",
          "The attendance sheet marks students present or absent and homework done, one by one or for every selected student in one request, with feedback for each student.",
          "Duration, expenses and highlights of a session are saved and the session is closed as taken; an upcoming session can be handed back with a replacement request.",
        ],
      },
      {
        title: "Availability and profile",
        points: [
          "Weekly availability is drawn on a week calendar next to the instructor's sessions, with the hours per week and the upcoming sessions that fall outside it.",
          "The profile edits contact details, skills, languages, preferences and payment methods, with photo, CV and ID uploads; the national ID shows only its last four digits.",
        ],
      },
      {
        title: "Parent portal",
        points: [
          "Parents see each child with the track recommended for them, add a child in a short form, and book levels course by course, studying alone or in a group.",
          "One booking follows the parent from the levels to the checkout, grouped by child, and ends with the transfer receipt; every page works in English and in Arabic, right to left.",
        ],
      },
    ],
    decisions: [
      {
        title: "Built on the existing endpoints",
        detail:
          "The overview, round progress, the needs-your-input list and the availability check are computed from the sessions and rounds the API already returned to the instructor, so none of them needed a backend change.",
      },
      {
        title: "One set of session rules",
        detail:
          "One module maps the API's statuses (Pending, Running, Complete, Canceled for rounds; taken, not taken for sessions) to labels and colours and decides what still needs input, so the overview, the tables and the session dialog always agree.",
      },
      {
        title: "Filters and paging in the address",
        detail:
          "Filters, sort and page live in the URL and server components send them to the API, so a filtered list survives a reload or a shared link and the counter counts the rows the API reports.",
      },
      {
        title: "One booking for the whole portal",
        detail:
          "The parent's booking is one React context kept in session storage, so it survives moving between pages and a reload, and the header badge, the student cards, the level cards and the checkout all read the same list.",
      },
    ],
    title: "Hemex dashboards",
    category: "dashboards",
    summary:
      "A coding academy for children: the instructor dashboard for sessions, attendance and availability, and the parent portal for students and level booking.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "MUI",
      "Tailwind CSS",
      "NextAuth",
      "React Hook Form",
      "Zod",
      "next-intl",
      "Radix UI",
      "Recharts",
      "FullCalendar",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/hemex-dashboards/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Hemex instructor dashboard overview with the next session, this month's sessions and hours, hours taught per month and round progress, shown with sample data.",
      caption: "Instructor overview.",
    },
    productContext: [
      "Hemex is a coding academy for children in Egypt. Students learn in rounds of weekly sessions, and the platform has a separate app for each role around one API.",
      "This project covers two of them: the instructor dashboard (Next.js with MUI, NextAuth and server actions) and the parent portal (Next.js with Tailwind, Radix UI primitives and next-intl in English and Arabic).",
    ],
    usersAndProblems: [
      "Instructors teach several rounds a week and need to know what is next, take attendance and homework quickly, leave feedback for each child, say when they can teach and hand back a session they cannot give.",
      "Parents need to see which track suits each child, add a new child and book the next levels without phoning the academy.",
    ],
    workflows: [
      "Session: the overview or the sessions list opens a session; the instructor marks attendance and homework for the group, writes feedback, adjusts duration or expenses and closes it as taken.",
      "Replacement: an upcoming session is handed back with one request, and the request shows on the session and on the overview until operations approve it.",
      "Booking: a parent opens a child's recommended track, adds levels course by course, reviews the booking grouped by child and attaches the transfer receipt.",
    ],
    designDecisions: [
      "Status reads the same everywhere: Taken in green, Not closed in amber for a past session without attendance, Upcoming in blue, and the round status in the brand purple.",
      "The attendance sheet puts bulk actions above the students and saves each change as it is made, so a group of eight is marked in a few clicks and nothing is lost if the dialog closes.",
      "The parent portal uses logical spacing (start and end instead of left and right), so the same components lay out correctly in Arabic, right to left.",
    ],
    role: [
      "Front-end developer on the Hemex platform team from November 2024 to May 2025: the instructor dashboard, the parent portal, front-end prototypes of the sales and finance consoles, and the rounds and sessions screens of the admin app.",
    ],
    screens: [
      {
        src: "/projects/hemex-dashboards/screens/01-overview.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex instructor overview with the next session and a replacement request, monthly sessions and hours, hours taught per month and round progress, shown with sample data.",
        caption: "Instructor overview.",
      },
      {
        src: "/projects/hemex-dashboards/screens/02-rounds.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex instructor rounds table with one round open on its eight sessions, their attendance and status, shown with sample data.",
        caption: "Rounds and their sessions.",
      },
      {
        src: "/projects/hemex-dashboards/screens/03-sessions.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex instructor sessions table with filters, attendance counts and taken, not closed and upcoming statuses, shown with sample data.",
        caption: "Sessions.",
      },
      {
        src: "/projects/hemex-dashboards/screens/04-attendance.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex attendance sheet for one session with counts, session details, bulk actions for two selected students and feedback per student, shown with sample data.",
        caption: "Attendance sheet.",
      },
      {
        src: "/projects/hemex-dashboards/screens/05-availability.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex availability week with weekly slots behind the instructor's sessions, the hours per week and sessions outside the availability, shown with sample data.",
        caption: "Weekly availability.",
      },
      {
        src: "/projects/hemex-dashboards/screens/06-profile.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex instructor profile with contact details, skills, languages, payment methods and a masked national ID, shown with sample data.",
        caption: "Instructor profile.",
      },
      {
        src: "/projects/hemex-dashboards/screens/07-parent-students.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex parent portal with two children and the track recommended for each, shown with sample data.",
        caption: "Parent portal, students.",
      },
      {
        src: "/projects/hemex-dashboards/screens/08-parent-booking.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex parent portal booking a track for one child, with the courses as steps, the study option and one level added, shown with sample data.",
        caption: "Booking levels.",
      },
      {
        src: "/projects/hemex-dashboards/screens/09-parent-cart-arabic.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Hemex parent portal checkout in Arabic, right to left, with two booked levels, the transfer number and an uploaded receipt, shown with sample data.",
        caption: "Checkout in Arabic.",
      },
      {
        src: "/projects/hemex-dashboards/screens/10-phone-overview.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Hemex instructor overview on a phone, with the next session and the month's figures as cards, shown with sample data.",
        caption: "Instructor overview on a phone.",
      },
    ],
  },
  {
    slug: "falcon-translation-dashboard",
    scope:
      "Built the Falcon operations dashboard: an overview of the pipeline, leads and projects, translators, interpreters, clients, reviews, subscriptions and contact requests, with status filters throughout.",
    features: [
      {
        title: "The pipeline at a glance",
        points: [
          "The overview counts new leads and quoted, converted and waiting projects with their value, and lists what needs attention: leads waiting over a day and projects due soon or overdue.",
          "A chart shows requests received per month, and a side panel counts translators, interpreters, reviews to approve and open contact requests, each linking to its list.",
        ],
      },
      {
        title: "Leads and projects",
        points: [
          "New leads show how long each request has waited and flag the ones queued for more than 24 hours.",
          "Projects filter by status with counts, show the price, and mark quotes untouched for a day and projects due within 3 days or overdue.",
          "Editing a project keeps its status, lists the translators who cover its language pair first with their rates, and shows the price as words times rate.",
        ],
      },
      {
        title: "People and inbox",
        points: [
          "Translators and interpreters list their language pairs and their rates per word or per hour; clients show their project and its dates.",
          "Contact requests split into open and handled, and reviews into waiting for approval and shown on the website, each with a count.",
          "A newsletter goes to the selected subscribers with a title and a message.",
        ],
      },
      {
        title: "Every table",
        points: [
          "Search, sorting, filters and paging, with export of all rows, the current page or the selected rows to CSV.",
          "Deleting asks for confirmation first, and a failed request shows the server's message.",
        ],
      },
    ],
    decisions: [
      {
        title: "One API client",
        detail:
          "Every view calls one client whose address comes from the build environment. It adds the saved token to each request, and a 401 signs the user out. Before, each view called the production host itself.",
      },
      {
        title: "Built on the existing endpoints",
        detail:
          "The overview, status tabs, due dates and translator matching work on lists the API already returns, so none of them needed a backend change.",
      },
      {
        title: "One set of status rules",
        detail:
          "One module defines the statuses, the 24-hour and 3-day rules and the language-pair match, so the overview, the tables and the edit page always agree.",
      },
      {
        title: "Menus as data",
        detail:
          "Each module is a menu definition (id, title, route, icon), so adding a module means one definition and one route; the highlighted item follows the router's current route.",
      },
    ],
    title: "Falcon translation dashboard",
    category: "dashboards",
    summary:
      "An operations dashboard for a translation agency: the pipeline at a glance, leads, projects, translators, interpreters, clients, reviews and newsletters.",
    builtWith: [
      "React",
      "MUI",
      "material-react-table",
      "React Router",
      "Axios",
      "ApexCharts",
      "Day.js",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/falcon-translation-dashboard/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of the Falcon translation dashboard overview with counts of new leads and projects by status, a requests chart and a needs-attention list, shown with sample data.",
      caption: "Overview.",
    },
    productContext: [
      "Falcon is a translation and interpreting agency. The dashboard is the staff's internal tool for turning website requests into quoted, assigned and delivered jobs.",
      "It is a Create React App project on a Berry-style MUI admin template, working against the agency's Node API.",
    ],
    usersAndProblems: [
      "A small operations team needs to see new requests as they arrive, follow up quotes before they go cold, give each job to a translator who covers the language pair, and keep on top of reviews and contact messages.",
    ],
    workflows: [
      "Lead to project: a website request appears as a new lead, gets its words, rate and dates on the edit page and a translator who covers the pair, then moves from Quoted to Converted, Waiting and Closed.",
      "Follow-up: the overview and the status tabs show stale leads, old quotes and projects due soon, each one click from its edit page.",
      "Inbox: contact requests are marked as handled, reviews are approved for the website, and subscribers receive a newsletter.",
    ],
    designDecisions: [
      "Status reads the same everywhere: a coloured chip for each status, red for a lead that has waited more than a day, and outlined chips for due soon and overdue.",
      "Filters are tabs with counts above each table, so the size of each queue is visible before it is opened.",
      "The overview uses the template's MUI cards, and every figure links to the list behind it.",
    ],
    role: [
      "Front-end developer on the dashboard from November 2024 to January 2025: the pipeline overview, leads and projects, the people and inbox modules, the new-lead flow, delete confirmations and date formatting.",
    ],
    screens: [
      {
        src: "/projects/falcon-translation-dashboard/screens/01-overview.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard overview with project counts and values, a requests chart, a team and inbox panel and a needs-attention list, shown with sample data.",
        caption: "Overview.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/02-new-leads.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard new leads table, with two requests flagged as waiting more than a day, shown with sample data.",
        caption: "New leads, with waiting time.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/03-projects.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard projects table with status tabs and counts, highlighted old quotes and due and overdue chips, shown with sample data.",
        caption: "Projects by status.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/04-edit-project.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard project edit page with the price as words times rate and translators who cover English to Arabic listed first, shown with sample data.",
        caption: "Editing a project, translator match.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/05-translators.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard translators table with language pairs, rates per word and qualifications, shown with sample data.",
        caption: "Translators.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/06-clients.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard clients table with each client's project and dates, shown with sample data.",
        caption: "Clients.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/07-contact-requests.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard contact requests with Open, Handled and All tabs, shown with sample data.",
        caption: "Contact requests, open and handled.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/08-reviews.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard reviews waiting for approval, with star ratings and a switch to show each one on the website, shown with sample data.",
        caption: "Reviews waiting for approval.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/09-newsletter.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard subscriptions page with a newsletter title and message and two subscribers selected, shown with sample data.",
        caption: "Newsletter to subscribers.",
      },
      {
        src: "/projects/falcon-translation-dashboard/screens/10-phone-overview.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Falcon translation dashboard overview on a phone, with the project counts stacked as cards, shown with sample data.",
        caption: "Overview on a phone.",
      },
    ],
  },
  {
    slug: "aligna",
    scope:
      "Built the whole Aligna front end: the doctor's case wizard and case workspace, real-time chat, a dashboard for each role and the administration behind them.",
    features: [
      {
        title: "Case submission",
        points: [
          "A three-step wizard (prescription, uploads, clinic and shipping) checks each step before moving on and can save the case as a draft at any point.",
          "Treatment preferences start from the doctor's saved defaults, so a routine case needs only the patient-specific answers.",
          "Scans, photos and radiographs upload in the background with progress cards that stay visible while the doctor keeps working.",
        ],
      },
      {
        title: "Case progress and next steps",
        points: [
          "Every case shows where it is in six phases, from submitted to delivered, with the date the next update is expected.",
          "The next step is written for whoever is looking: a doctor sees what to approve or pay, the design and production teams see what to do next.",
          "One button opens the section that step needs, such as Results to review a plan or Shipment to send the aligners.",
          "On a plan, the doctor can approve it or request changes: tag what needs changing, write a note, and it reaches the designer in the case chat.",
        ],
      },
      {
        title: "One workspace per case",
        points: [
          "Eleven sections hold the whole case: details, patient, clinical conditions, photos, scans, radiographs, results, payments, shipments, refinements and lost aligners.",
          "An activity log records every submission, assignment, upload and status change with who did it and when.",
          "Doctors and the team talk in a real-time chat on the case, with attachments and a needs-reply flag; the team also keeps internal notes the doctor never sees.",
        ],
      },
      {
        title: "A dashboard for each role",
        points: [
          "Doctors see completed, refined and draft cases, cases submitted per month, and the cases that need their approval, reply or payment.",
          "Designers, technicians and customer service see the queues waiting on them, each opening the cases list already filtered.",
          "Administrators follow activity against a target, package usage, sales, new doctors, cases per zone and team turnaround, over any date range.",
        ],
      },
      {
        title: "Running the service",
        points: [
          "New doctors register and wait in an approval queue that administrators review, approve or reject.",
          "Packages, payment requests (paid or rejected), clinic lists, form options, weekly meeting slots and meeting requests are all managed in the app.",
          "Contact Us opens WhatsApp with the open case already named, email, or, for doctors, a meeting booking.",
        ],
      },
    ],
    decisions: [
      {
        title: "Access decided once, at the edge",
        detail:
          "Middleware checks every request against one table of route prefixes and the roles allowed in (for example payments for administrators and customer service, preferences for doctors only, no add-case for technicians) and redirects anyone else, so no page has to repeat the rule.",
      },
      {
        title: "The server stays the source of truth",
        detail:
          "Chat and notification sockets do not patch local copies of the data. Each event invalidates the matching TanStack Query keys, so lists, badges and messages refetch and always match the server.",
      },
      {
        title: "One form for new and existing cases",
        detail:
          "A single form hook drives both the three-step wizard and the eleven-section case view, with a Zod schema per step. Any section can be opened from a link (?tab=results), which is how the progress tracker sends people to the right place.",
      },
      {
        title: "Progress derived, not stored",
        detail:
          "The six phases and the role-specific next step are worked out from the case's existing status, payment state and expected date in one small module, so the tracker needed no new API and cannot drift from the status the team sets.",
      },
      {
        title: "Upload state keyed by case and field",
        detail:
          "A root-level upload provider keeps a map keyed by case ID and field name, so an upload survives moving between pages and every input restores its file and progress from that shared state.",
      },
      {
        title: "Counts from the API, not the page",
        detail:
          "The work-queue cards ask the cases endpoint for each status and read its total, instead of counting the rows a page happens to hold, so a busy queue is never under-reported.",
      },
    ],
    title: "Aligna",
    category: "dashboards",
    summary:
      "A case-management platform for a clear-aligner lab: doctors submit and follow cases, and the design, production and support teams work them through to delivery.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "TanStack Query",
      "TanStack Table",
      "React Hook Form",
      "Zod",
      "NextAuth.js",
      "Socket.IO",
      "Recharts",
      "Headless UI",
    ],
    period: "2025",
    progress: "completed",
    image: {
      src: "/projects/aligna/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of an Aligna case page: the six-phase progress tracker asking the doctor to review the treatment plan, with sample data.",
      caption: "Real interface rendered from the project's code with sample data.",
    },
    productContext: [
      "Aligna runs a clear-aligner lab's work with its clinics. Doctors submit patient cases with photos, scans and radiographs; designers prepare the treatment plan; technicians make and ship the aligners; customer service and administrators look after doctors, packages, payments and meetings. The front end is Next.js 15.5 (App Router), React 19, TypeScript and Tailwind CSS 4, talking to the lab's API, with real-time updates over Socket.IO.",
    ],
    usersAndProblems: [
      "A case passes through five roles and dozens of files, and each role needs a different slice of it. Doctors need a quick, guided way to send a complete prescription and to know at a glance what is waiting on them; the lab's teams need their own queues, the case history and a direct line to the doctor; administrators need to onboard clinics and see how the service is running.",
    ],
    workflows: [
      "A case starts as a draft in the wizard, is submitted, gets a treatment plan from a designer, is approved by the doctor, is paid for, then is fabricated, shipped and delivered. Refinements and lost-aligner replacements continue it after delivery. Every step is visible on the case page and in the activity log, and each role's dashboard surfaces the cases waiting on them.",
    ],
    designDecisions: [
      "The app is organised by role. Navigation, dashboards and actions are filtered by the signed-in role, and the same shell works as a side navigation with tables on desktop and a bottom navigation with card lists on phones.",
    ],
    role: [
      "Front-end developer and sole author of the Aligna front end, from the first commit: the case wizard and workspace, chat and notifications, the role dashboards and analytics, the administration screens and the responsive shell.",
    ],
    outcomes: [
      "Delivered the full case lifecycle for five roles, from doctor registration to delivery, refinements and replacements.",
      "One responsive app: doctors can follow a case, approve a plan or answer a message from a phone as well as a desktop.",
    ],
    screens: [
      {
        src: "/projects/aligna/screens/01-dashboard.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Aligna doctor dashboard: case counts and a cases-submitted-per-month chart, shown with sample data.",
        caption: "Doctor dashboard.",
      },
      {
        src: "/projects/aligna/screens/02-new-case.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the first step of the Aligna new-case wizard, filled in with sample patient details.",
        caption: "New-case wizard, prescription step.",
      },
      {
        src: "/projects/aligna/screens/03-case-progress.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an Aligna case page with the six-phase progress tracker asking the doctor to review the treatment plan, shown with sample data.",
        caption: "Case progress and the doctor's next step.",
      },
      {
        src: "/projects/aligna/screens/04-request-changes.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Aligna request-changes dialog: reason tags and a doctor's note for the design team, shown with sample data.",
        caption: "Requesting changes to a treatment plan.",
      },
      {
        src: "/projects/aligna/screens/05-chat-activity.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an Aligna case's activity log, chat between doctor and designer, and internal notes, shown with sample data.",
        caption: "Activity log, case chat and internal notes.",
      },
      {
        src: "/projects/aligna/screens/06-cases.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Aligna cases list as the team sees it, with statuses, due dates and assignments, shown with sample data.",
        caption: "Cases list for the lab team.",
      },
      {
        src: "/projects/aligna/screens/07-work-queue.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Aligna designer dashboard with its work queue, shown with sample data.",
        caption: "Designer work queue.",
      },
      {
        src: "/projects/aligna/screens/08-admin-analytics.png",
        width: 2880,
        height: 3400,
        kind: "capture",
        alt: "Capture of the Aligna admin analytics: activity against target, package usage, sales, doctors and cases submitted, shown with sample data.",
        caption: "Admin analytics.",
      },
      {
        src: "/projects/aligna/screens/09-doctor-request.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of an Aligna doctor registration request open for review, with approve and reject, shown with sample data.",
        caption: "Reviewing a doctor's registration.",
      },
      {
        src: "/projects/aligna/screens/10-phone-progress.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of an Aligna case on a phone: the progress tracker stacked vertically, asking for the requested payment, shown with sample data.",
        caption: "Case progress on a phone.",
      },
    ],
  },
  {
    slug: "wajihni",
    scope:
      "Built Wajihni alone, from the Express and MongoDB API to the Next.js interface: companies publish training programs, students apply, and companies decide.",
    features: [
      {
        title: "Finding and applying",
        points: [
          "Students search programs by name or company, filter by field and duration, and can show only programs that are open with seats left.",
          "Before applying, a student sees the program, how many seats are left and exactly what the company will see from their profile.",
          "Each application shows its steps, from the date it was sent to the company's decision, under a count of pending, accepted and rejected.",
        ],
      },
      {
        title: "Running programs as a company",
        points: [
          "An overview counts open programs, applications received and seats left, and each program shows how full it is.",
          "Companies add, edit and close programs, with the duration, capacity and field checked against the API's rules.",
          "Applicants are listed with skills, age and nationality, with tabs by status and a search by name or skill.",
          "Rejecting asks first, because the student is emailed and the decision cannot be changed.",
        ],
      },
      {
        title: "Accounts",
        points: [
          "Separate sign-up for students and companies, activation by email, sign-in, forgotten and changed passwords.",
          "Sign-up checks names, passwords and phone numbers with the same rules as the API, so mistakes show before the form is sent.",
          "Students complete a profile once (age, nationality, skills as tags) and can update their skills later.",
        ],
      },
      {
        title: "Checks and emails in the API",
        points: [
          "Before an application is created, the API checks the student's profile, duplicate applications, whether the program is open and whether seats are left.",
          "Applying, acceptance and rejection each send the student an email.",
        ],
      },
    ],
    decisions: [
      {
        title: "Roles decide the routes",
        detail:
          "Middleware reads the role from the sign-in token, so a company is sent away from student pages and a student from company pages, signed-in users skip the sign-up pages, and visitors can still open sign-in and password pages directly.",
      },
      {
        title: "Data on the server, actions through server actions",
        detail:
          "Pages fetch on the server and changes go through Next.js server actions, which attach the token from a cookie, so components never call the API themselves.",
      },
      {
        title: "One validation step for every route",
        detail:
          "Express middleware merges the body, route parameters and query into one object for Joi and returns every error at once rather than the first one.",
      },
      {
        title: "Applications as their own model",
        detail:
          "An application references the student and the program, and the program keeps a count of applications, so capacity can be checked without loading every application.",
      },
      {
        title: "Built from the data the API returns",
        detail:
          "Search, filters, the company overview and the status tabs work on lists the API already returns, so the interface gained them without new endpoints.",
      },
    ],
    title: "Wajihni",
    category: "saas-products",
    summary:
      "A platform where companies publish training programs and internships, students apply, and companies review applicants and decide.",
    builtWith: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "daisyUI",
      "React Hook Form",
      "Express",
      "MongoDB",
      "Mongoose",
      "Joi",
      "Nodemailer",
    ],
    period: "2024",
    progress: "completed",
    image: {
      src: "/projects/wajihni/card.png",
      width: 1600,
      height: 1000,
      kind: "capture",
      alt: "Capture of Wajihni training programs filtered to Technology, with the student's status on each, shown with sample data.",
      caption: "Training programs, filtered.",
    },
    productContext: [
      "Wajihni connects students with companies through training programs and internships. Companies publish programs with a duration, field and capacity; students apply and follow each application to a decision.",
      "Pages: home, sign-up for each side, sign-in, account activation, password recovery, profile completion, and dashboards for students (programs, applications, skills) and companies (programs, applicants).",
    ],
    usersAndProblems: [
      "Students need to find programs that fit their field and know where each application stands. Companies need to publish programs and decide on applicants without spreadsheets or email threads, and both need a safe sign-up with email activation.",
    ],
    workflows: [
      "Student: sign up, activate, complete the profile, search and filter programs, check the details, apply, and follow the decision.",
      "Company: sign up, activate, add programs, watch the overview, review applicants by status, accept or reject, and close a program when it is done.",
    ],
    designDecisions: [
      "daisyUI's dark theme gives the dashboards one look with little custom CSS: badges for status, steps for progress, stats for the overview and a dialog for confirmations.",
      "On phones the dashboard sidebar opens from a menu button over a dimmed page and closes with Escape, the backdrop or a change of page.",
    ],
    role: ["Solo full-stack developer: built the front end and the API in March and April 2024."],
    outcomes: [
      "Delivered a two-sided platform end to end, from sign-up and activation to publishing programs, applying and deciding on applicants.",
    ],
    screens: [
      {
        src: "/projects/wajihni/screens/01-home.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Wajihni home page with sign-up cards for companies and students, shown with sample data.",
        caption: "Home page.",
      },
      {
        src: "/projects/wajihni/screens/02-how-it-works.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Wajihni how it works section with four steps for students and four for companies, shown with sample data.",
        caption: "How it works, for each side.",
      },
      {
        src: "/projects/wajihni/screens/03-signup-checks.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Wajihni student sign-up flagging passwords that do not match and an invalid phone number, shown with sample data.",
        caption: "Sign-up checks before sending.",
      },
      {
        src: "/projects/wajihni/screens/04-programs-filter.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Wajihni training programs filtered to Technology, showing accepted and pending statuses, shown with sample data.",
        caption: "Searching and filtering programs.",
      },
      {
        src: "/projects/wajihni/screens/05-program-details.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of a Wajihni program before applying: details, seats left and the profile details the company will see, shown with sample data.",
        caption: "Program details before applying.",
      },
      {
        src: "/projects/wajihni/screens/06-applications.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Wajihni student applications with counts by status and the progress of each application, shown with sample data.",
        caption: "Applications and their progress.",
      },
      {
        src: "/projects/wajihni/screens/07-complete-profile.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Wajihni profile completion step with age, nationality and skills entered as tags, shown with sample data.",
        caption: "Completing the student profile.",
      },
      {
        src: "/projects/wajihni/screens/08-company-overview.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of the Wajihni company dashboard with open programs, applications received and seats left, shown with sample data.",
        caption: "Company overview.",
      },
      {
        src: "/projects/wajihni/screens/09-applicants.png",
        width: 2880,
        height: 1920,
        kind: "capture",
        alt: "Capture of Wajihni applicants for one program with status tabs, search, skills and accept or reject, shown with sample data.",
        caption: "Reviewing applicants.",
      },
      {
        src: "/projects/wajihni/screens/10-phone-menu.png",
        width: 780,
        height: 1688,
        view: "phone",
        kind: "capture",
        alt: "Capture of the Wajihni student dashboard on a phone with the menu open, shown with sample data.",
        caption: "Dashboard menu on a phone.",
      },
    ],
  },
];
