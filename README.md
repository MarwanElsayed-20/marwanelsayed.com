# marwanelsayed.com

The source of my portfolio: **[marwanelsayed.com](https://marwanelsayed.com)**. It is where I show
the websites, online stores, SaaS products and dashboards I have built, with a case study for
each one.

Built with Next.js (App Router), strict TypeScript, Tailwind CSS, React Three Fiber and GSAP, and
covered by about 120 unit test files (Vitest) and 60 browser specs (Playwright).

## What is in it

- **One 3D hero**, loaded lazily. A capability check picks the WebGL scene or a static fallback,
  and a frame monitor steps down if the device struggles.
- **Work index** (`/work`): filters, then every project as a numbered row. Hovering a row brings
  that project's colour world in behind the page.
- **Case studies** (`/websites-ecommerce/<slug>`, `/saas-dashboards/<slug>`): typed project records,
  checked at build time, rendered as numbered chapters with captures of the real interface (shown
  with sample data).
- **Services** (`/services`, `/services/<id>`) and **About** (`/about`), all server-rendered.
- **Contact form** posting to `POST /api/contact`. It validates the message, rate-limits, checks
  the origin and drops honeypot submissions. It then delivers the message as an email through
  Resend and to my own dashboard ([dashboard](https://github.com/MarwanElsayed-20/dashboard)) in
  parallel, and only reports success once one of them has accepted it.
- **Motion with a way out**: an intro loader, page transitions, scroll reveals and smooth scrolling.
  All of it is turned off under `prefers-reduced-motion`, and every page stays readable without
  JavaScript.
- **SEO**: per-page metadata, generated Open Graph images, a sitemap and robots.

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · Three.js / React Three Fiber · GSAP ·
Lenis · Vitest · Testing Library · Playwright · ESLint · Prettier · Vercel (Analytics and Speed
Insights)

## Run it locally

Needs Node.js 22 and pnpm 9 (pinned in `package.json`).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to `.env.local` if you want to try the contact form. The site builds and runs
without any variables.

## Checks

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm lint`      | ESLint with zero warnings allowed                        |
| `pnpm typecheck` | `tsc --noEmit` in strict mode                            |
| `pnpm test`      | Vitest unit and component tests                          |
| `pnpm build`     | Production build                                         |
| `pnpm test:e2e`  | Playwright in Chromium, Firefox and WebKit (build first) |

## Structure

```text
src/
  app/          routes, metadata, Open Graph images, the contact API route
  components/   hero, layout (header, menu, footer, loader), projects, site sections, ui
  content/      the project records and the site's copy
  lib/          validation, motion, contact delivery, project indexing and other plain logic
  styles/       design tokens
e2e/            Playwright specs: navigation, keyboard, reduced motion, accessibility, contact
scripts/        build-time tools for artwork, brand files and colour worlds
```

Unit tests sit next to the code they test.

---

The code is public so you can see how I work. The project captures, copy and brand files are mine
and not for reuse.
