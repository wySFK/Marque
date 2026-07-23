# MARQUE

<img width="1919" height="1079" alt="Marque" src="https://github.com/user-attachments/assets/4ebb1064-c69f-46cd-b39a-52afebe5493a" />


## Overview

MARQUE allows users to discover, compare, and inquire about vehicles while giving verified dealers the ability to manage inventory, handle inquiries, and track performance.

The platform focuses on a luxury automotive experience with high-quality vehicle presentations, secure authentication, and dealer verification.

## Built With

- **TanStack Start** — React 19, Vite, SSR
- **TypeScript** — Type-safe development
- **Supabase** — Authentication, PostgreSQL database, Row-Level Security
- **Stripe Identity** — Dealer identity verification
- **Tailwind CSS v4** — Styling and responsive UI
- **GSAP + Framer Motion** — Animations and transitions
- **Lenis + ScrollTrigger** — Smooth scrolling effects

## Features

### Marketplace

- Vehicle listings with high-resolution images, specifications, and history details
- Search and filtering by:
  - Make
  - Model
  - Price
  - Body style
  - Fuel type
  - Transmission
  - Other vehicle attributes
- Detailed vehicle pages including:
  - Image gallery
  - Specifications
  - Features
  - Service history
  - Accident history
  - Dealer information
- Multi-vehicle inquiry system allowing users to contact multiple dealers in one request
- Vehicle comparison tool for side-by-side comparisons

---

## Authentication & User Roles

MARQUE uses role-based access control with three account types:

### Customer

- Browse vehicle listings
- Save favorite vehicles
- Submit inquiries
- Manage profile information

### Dealer

- Manage vehicle inventory
- Upload vehicle images
- View customer inquiries
- Access analytics dashboard

### Admin

- Manage users and roles
- Review dealer applications
- Verify dealers
- Moderate vehicle listings
- Handle reports and reviews
- View platform analytics

---

## Dealer System

### Dealer Application

Dealers can apply for verification through the platform. Identity verification is handled through Stripe Identity before receiving a verified dealer badge.

### Dealer Dashboard

Verified dealers can:

- Create, update, and remove vehicle listings
- Upload vehicle images
- Manage appointments
- View inquiries
- Track listing performance

---

## Admin Dashboard

Includes:

- User and role management
- Dealer application review
- Vehicle moderation
- Report management
- Analytics overview

---

## Pages

### Landing Page

- Hero section with vehicle search
- Featured vehicles
- Showcase reels
- Latest inventory
- Platform statistics
- Testimonials
- Call-to-action sections

### Other Pages

- Vehicle marketplace
- Dealer listings
- Vehicle details
- Consignment page
- Contact page
- Authentication pages
- Terms of Service
- Privacy Policy

---

## Design

MARQUE uses a dark luxury-inspired interface focused on automotive presentation.

Design features:

- Dark theme with minimal red accents
- Cinematic loading animation
- GSAP-powered hero animations
- Smooth scrolling interactions
- Responsive layout
- Desktop sidebar navigation

---

# Getting Started

## Requirements

- Node.js 20+ or Bun

## Installation

```bash
git clone https://github.com/your-username/marque.git

cd marque

bun install
