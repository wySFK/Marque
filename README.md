  <div align="center">
    <br />
    <h1>MARQUE</h1>
    <p><em>Precision. Curated.</em></p>
    <p>A premium online marketplace for buying, selling, and managing<br />high-performance and collector automobiles.</p>
    <br />
  </div>

---

## Overview

Marque is a full-stack web application for verified automotive listings. It combines editorial presentation with dealer tools, identity verification, and a seamless inquiry workflow — built for the high-end collector car market.

### Built with

- **[TanStack Start](https://tanstack.com/start/latest)** (React 19, Vite, SSR)
- **[Supabase](https://supabase.com/)** — Auth, PostgreSQL, Row-Level Security
- **[Stripe Identity](https://stripe.com/identity)** — Dealer identity verification
- **[GSAP](https://gsap.com/)** + **[Framer Motion](https://www.framer.com/motion/)** — Animation & transitions
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[TypeScript](https://www.typescriptlang.org/)** — Type safety throughout

---

## Features

### Marketplace
- **Curated inventory** — Editorial listings with high-resolution imagery, full specs, and provenance details
- **Search & filtering** — By make, model, price, body style, fuel type, transmission, and more
- **Vehicle detail pages** — Gallery, spec grid, feature list, service/accident history, dealer card
- **Cart & multi-dealer inquiry** — Select multiple vehicles and send a single consolidated inquiry to the relevant dealers
- **Compare tool** — Side-by-side vehicle comparison

### Authentication & Roles
- **Email/password sign up & sign in** — With rate limiting, email verification, and password reset flow
- **Role-based access** — Three roles: `customer`, `dealer`, `admin`
  - **Customers** — Browse, save favorites, submit inquiries, manage profile
  - **Dealers** — Manage inventory, view inquiries, analytics dashboard
  - **Admins** — User management, dealer verification, vehicle moderation, reports, review moderation

### Dealer System
- **Dealer application flow** — Apply to become a verified dealer with Stripe Identity verification
- **Dealer dashboard** — Inventory CRUD with image upload, appointment management, inquiry inbox, performance analytics
- **Verification badges** — Verified dealers are badged across the platform

### Admin Dashboard
- User & role management
- Dealer application review with accept/reject
- Vehicle moderation
- Report management
- Site analytics overview

### Content & Pages
- **Landing page** — Hero with search, featured acquisitions, video showcase reels, latest inventory grid, stats, testimonials, CTA
- **Consignment page** — Sell your vehicle through Marque's editorial process
- **Contact page** — Multi-channel contact with an inquiry form
- **Auth pages** — Sign in, sign up, forgot password, reset password
- **Static pages** — Terms of Service, Privacy Policy

### Visual Design
- Dark-only theme with editorial luxury aesthetic
- Signature red accent used sparingly for micro-accents
- Cinematic preloader with GSAP-powered hero reveal
- Smooth scrolling via Lenis + ScrollTrigger integration
- Responsive layout with sidebar navigation on desktop

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+

### 1. Clone & install

```bash
git clone https://github.com/your-username/marque.git
cd marque
bun install
```

### 2. Start the dev server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

---

## Project structure

```
src/
├── components/
│   ├── site/          # Site-wide components (Preloader, Footer, SideRail, etc.)
│   └── ui/            # shadcn/ui primitives (Button, Input, Tabs, etc.)
├── data/
│   └── cars.ts        # Car catalog & listing data
├── hooks/
│   └── use-auth.ts    # Authentication hook
├── integrations/
│   └── supabase/      # Supabase client, auth middleware, types
├── lib/               # Utilities (rate limiter, Stripe, admin helpers, etc.)
├── routes/            # File-based routes (TanStack Start)
│   ├── __root.tsx     # App shell
│   ├── index.tsx      # Landing page
│   ├── auth.tsx       # Sign in / Sign up
│   ├── cars/          # Marketplace
│   ├── dealers/       # Dealer listings
│   ├── _authenticated/ # Protected routes (account, admin, dealer, apply)
│   └── ...
├── server.ts          # Server entry with error handling & security headers
├── start.ts           # TanStack Start instance with middleware
└── styles.css         # Design tokens, utilities, custom CSS animations

server/
└── routes/
    └── api/
        └── stripe-identity-webhook.ts  # Stripe webhook handler

```

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

---

## Security

- **Rate limiting** — Sign-in (5/min per email) and sign-up (3/15min per email) attempts
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
- **Source maps disabled** in production builds
- **Stripe webhook signature verification** for identity callbacks

---

## Deployment

Marque is built to deploy on any platform that supports Node.js SSR (Vercel, Cloudflare Pages, Netlify, Railway, etc.).

### Build

```bash
bun run build
```

Output is in `dist/`.

### Environment variables

Ensure the same `.env` variables are set in your deployment environment. For Stripe Identity webhooks, also add:

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## License

Private — All rights reserved.
