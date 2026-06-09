# Delhi NCR Event Planner — PRD

## Original Problem Statement
Build a complete production-ready full-stack event planning platform for Delhi NCR.
Premium luxury event planning website with a public marketing site + admin dashboard.
Primary goal: lead generation & customer conversion.

## Tech Stack
- Frontend: React 19, React Router DOM, Framer Motion, Tailwind, shadcn/ui (admin), Sonner
- Backend: FastAPI, Motor (async MongoDB), PyJWT, bcrypt
- Storage: Emergent built-in object storage
- DB: MongoDB
- Auth: JWT (Bearer + httpOnly cookie)

## User Personas
- **Visitor / Prospective Client**: Browse event packages, gallery, testimonials; submit contact form; WhatsApp inquiry.
- **Admin (Business Owner)**: Manage packages, leads, testimonials, gallery; view analytics.

## Core Requirements (Static)
- Luxury lavender/deep-purple aesthetic (#BFA2DB, #6B4F8C, #F8F5F2)
- Playfair Display headings + Poppins body
- Fully responsive, SEO meta + sitemap + robots
- WhatsApp prefilled inquiry to +91 87963 06375

## Implementation Status (2026-02-09)
### ✅ Done
- Backend: full server.py with auth, packages, leads, gallery, testimonials, image upload, analytics
- Demo seed: 21 packages (7 categories × 3 tiers), 3 testimonials, 9 gallery items, 1 admin
- Frontend public: Navbar, Hero (animated counters), Events (7 cards), Why Choose Us, Packages (filterable), Gallery (filterable + lightbox), Testimonials, Contact form, Footer, Floating WhatsApp
- Package detail page with gallery thumbnails + WhatsApp inquiry
- Admin: Login, Dashboard analytics, Leads management (search/filter/status), Packages CRUD (with image upload via object storage), Testimonials CRUD, Gallery CRUD
- SEO: meta tags, OG tags, structured data, robots.txt, sitemap.xml
- Analytics placeholders for Google Analytics, Microsoft Clarity in index.html

### Tested
- Backend: 22/22 pytest passing
- Frontend: All critical flows verified via Playwright

## P0/P1/P2 Backlog
### P1
- Email notifications to admin when new lead arrives (Resend / SendGrid)
- Real Google Analytics + Microsoft Clarity integration (add IDs)
- Custom logo upload from admin settings page
- Multi-image upload UI for package gallery (currently one-at-a-time)

### P2
- Forgot password flow for admin
- Multiple admins / roles
- Lead-to-CRM export (CSV)
- Booking calendar / event date availability check
- Blog section for SEO
- Public package-detail SEO slug instead of UUID

## Test Credentials
See `/app/memory/test_credentials.md`
