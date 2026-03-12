# BooktFly — Project Documentation

## Platform Idea

BooktFly is a **travel marketplace** built for the Saudi Arabian and MENA market.

Instead of booking directly through airlines or scattered agency websites, travelers can browse and book flight trips listed by verified travel service providers — all in one place, in Arabic and English.

### How It Works

**For Travelers (Buyers)**
- Browse available flight trips from multiple providers
- Filter by origin, destination, cabin class, price, and trip type
- Book seats and pay through the platform
- Track all bookings from a personal dashboard

**For Providers (Travel Agencies & Hajj/Umrah Companies)**
- Apply to join the platform and get verified by the admin team
- List flight trips with custom pricing, seat counts, and details
- Manage bookings and track revenue
- Receive payouts after the platform deducts its commission

**For the Platform (Admin)**
- Review and approve/reject provider applications with document verification
- Monitor all trips, bookings, and revenue
- Suspend providers or remove trips when needed
- Configure the platform commission rate and legal content

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| i18n | next-intl 4 (Arabic default + English) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (notifications) |
| Email | Resend + React Email |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Package Manager | pnpm |

---

## What Was Built

### 1. Project Foundation
- Next.js 16 project with TypeScript, Tailwind CSS 4, and pnpm
- CSS-based theme (`@theme` directive) with custom color tokens for primary, accent, destructive, success, and warning states
- Full Arabic RTL and English LTR support via next-intl
- Translations in `messages/ar.json` and `messages/en.json` covering 14 sections and 230+ keys

### 2. Authentication
- Email + password login
- Magic link (passwordless) login
- User signup with email confirmation
- Password reset and update flows
- OAuth callback handler
- Role-based redirect after login (buyer → home, provider → dashboard, admin → admin panel)

### 3. Database & Types
- Complete TypeScript types matching the database schema (`types/database.ts`)
- Four Supabase client types: browser, server, admin (service role), and middleware
- Zod validation schemas for all forms

### 4. Middleware
- Combined next-intl i18n routing + Supabase session refresh in a single middleware
- Route protection by authentication status
- Role-based access control (buyer, provider, admin)
- Provider suspension check — suspended providers are redirected to a suspension notice page

### 5. Layout & Navigation
- Sticky navbar with the BooktFly logo (`navbar.png`), nav links, language switcher, notification bell, and user dropdown
- Footer with brand, quick links, and legal section
- Provider sidebar with dashboard, trips, bookings, revenue, and profile links
- Admin sidebar with all management sections
- Notification bell with real-time unread count via Supabase Realtime

### 6. Homepage
- Hero section with gradient background, search bar (origin, destination), and CTA
- Featured trips grid (fetched live from the database)
- How it works — 3-step explainer (search, book, fly)
- Become a provider CTA section
- Live stats (trips available, trusted providers, happy travelers)

### 7. Marketplace
- **Browse Trips** — filterable and sortable list with origin/destination search, cabin class filter, sort by price or date, empty state
- **Trip Detail** — full trip info, airline, route, departure date, cabin class, seats indicator, price, provider info, and booking form
- **Provider Profile** — public page showing provider info and all their active trips

### 8. Booking Flow
- Booking form with passenger details (name, phone, email, ID number, seat count)
- Dummy payment checkout — realistic credit card UI (card number, expiry, CVV) that simulates processing and auto-confirms
- Booking confirmation with reference number
- Atomic seat reservation using PostgreSQL `FOR UPDATE` row locking (prevents overbooking)

### 9. Buyer Dashboard
- **My Bookings** — list of all bookings with status badges and trip summaries
- **Booking Detail** — full breakdown including passenger info, trip details, payment summary (price per seat × seats, commission, provider payout), and cancellation option

### 10. Provider System
- **Become a Provider** — landing page explaining the benefits
- **Application Form** — company details (AR + EN), contact info, provider type (travel agency or Hajj/Umrah), document uploads (commercial registration, IATA, Hajj permit, tourism license, civil aviation)
- **Application Status** — live status page showing pending/approved/rejected with admin comment
- **Provider Dashboard** — stats overview (active trips, total bookings, revenue, seats sold)
- **Trip Management** — create, edit, view, and deactivate trips with image upload
- **Provider Bookings** — list of all bookings on their trips
- **Provider Revenue** — earnings breakdown with commission deductions
- **Provider Profile** — edit company info and contact details
- **Suspended Page** — shown to suspended providers with reason

### 11. Admin Panel
- **Dashboard** — key metrics (pending applications, active providers, trips, bookings, total revenue)
- **Applications** — list with status filter tabs, review individual applications with approve/reject and comment
- **Providers** — list all providers, view details, override commission rate, suspend/unsuspend with reason
- **Trips** — view all trips across providers, remove trips with a reason (notifies provider)
- **Bookings** — view all platform bookings, process refunds and cancellations
- **Revenue** — platform-wide revenue overview with per-provider breakdown table
- **Settings** — configure default commission rate, edit terms & conditions in Arabic and English

### 12. Notifications
- In-app real-time notifications via Supabase Realtime channel subscriptions
- Notification bell with unread count badge
- Dropdown with notification list and mark-as-read
- Smart deep links — each notification type links to the relevant page
- `notify()` function sends both in-app notification and transactional email via Resend

### 13. Email Templates (React Email)
Nine bilingual (Arabic + English) HTML email templates:
1. `application-approved.tsx` — provider application approved
2. `application-rejected.tsx` — application rejected with admin comment
3. `booking-confirmed.tsx` — booking confirmation for buyer (ref, route, seats, total)
4. `new-booking.tsx` — new booking notification for provider
5. `booking-cancelled.tsx` — booking cancelled notice
6. `booking-refunded.tsx` — refund confirmation with amount
7. `trip-removed.tsx` — trip removed by admin with reason
8. `account-suspended.tsx` — provider account suspended
9. `base-layout.tsx` — shared layout wrapper used by all templates

### 14. SQL Migration Script
A single comprehensive SQL file (`supabase-migration.sql`) ready to paste into the Supabase SQL Editor. It includes:
- **Enums** — user_role, provider_type, application_status, provider_status, trip_status, booking_status, trip_type, cabin_class, notification_type
- **Tables** — profiles, provider_applications, providers, trips, bookings, notifications, platform_settings
- **Triggers** — auto-create profile on signup, auto-update `updated_at` timestamps
- **Functions** — `book_seats()` (atomic seat reservation), `release_seats()`, `expire_past_trips()`, `cleanup_failed_payments()`
- **RLS Policies** — row-level security on every table with role-aware access rules
- **Storage Buckets** — provider-documents (private), trip-images (public), avatars (public)
- **pg_cron Jobs** — expire past trips every hour, clean up failed payments every 15 minutes
- **Indexes** — on all foreign keys and commonly filtered columns
- **Seed Data** — initial platform_settings row

---

## Project Structure

```
bookitfly/
├── app/
│   ├── layout.tsx                    # Root layout (pass-through)
│   ├── [locale]/
│   │   ├── layout.tsx                # Locale layout (html, body, providers)
│   │   ├── page.tsx                  # Homepage
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   ├── update-password/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── trips/
│   │   │   ├── page.tsx              # Browse trips
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Trip detail
│   │   │       └── book/page.tsx     # Booking form
│   │   ├── checkout/[bookingId]/page.tsx
│   │   ├── my-bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── providers/[id]/page.tsx   # Provider public profile
│   │   ├── become-provider/
│   │   │   ├── page.tsx              # Landing
│   │   │   ├── apply/page.tsx        # Application form
│   │   │   └── status/page.tsx       # Application status
│   │   ├── provider/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── bookings/page.tsx
│   │   │   ├── revenue/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── suspended/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx              # Dashboard
│   │       ├── applications/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── providers/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── trips/page.tsx
│   │       ├── bookings/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── revenue/page.tsx
│   │       └── settings/page.tsx
│   └── api/
│       ├── bookings/
│       │   ├── route.ts              # Create booking
│       │   ├── mine/route.ts         # Buyer's bookings
│       │   ├── provider/route.ts     # Provider's bookings
│       │   └── [id]/
│       │       ├── route.ts          # Get booking
│       │       └── confirm/route.ts  # Confirm payment
│       ├── trips/
│       │   ├── route.ts              # List / create trip
│       │   ├── my-trips/route.ts
│       │   └── [id]/
│       │       ├── route.ts          # Get / update trip
│       │       └── deactivate/route.ts
│       ├── providers/
│       │   ├── apply/route.ts
│       │   ├── my-application/route.ts
│       │   └── reapply/route.ts
│       └── admin/
│           ├── applications/[id]/route.ts
│           ├── providers/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── trips/[id]/remove/route.ts
│           ├── bookings/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── refund/route.ts
│           │       └── cancel/route.ts
│           ├── revenue/route.ts
│           └── settings/route.ts
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── language-switcher.tsx
│   │   ├── notification-bell.tsx
│   │   ├── provider-sidebar.tsx
│   │   └── admin-sidebar.tsx
│   ├── trips/
│   │   ├── trip-card.tsx
│   │   ├── trip-status-badge.tsx
│   │   └── seats-indicator.tsx
│   ├── bookings/
│   │   └── booking-status-badge.tsx
│   ├── shared/
│   │   ├── empty-state.tsx
│   │   └── loading-skeleton.tsx
│   └── ui/
│       └── toaster.tsx
├── emails/
│   ├── base-layout.tsx
│   ├── application-approved.tsx
│   ├── application-rejected.tsx
│   ├── booking-confirmed.tsx
│   ├── new-booking.tsx
│   ├── booking-cancelled.tsx
│   ├── booking-refunded.tsx
│   ├── trip-removed.tsx
│   └── account-suspended.tsx
├── hooks/
│   ├── use-user.ts
│   ├── use-notifications.ts
│   ├── use-provider.ts
│   └── use-debounce.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── validations.ts
│   └── notifications.ts
├── messages/
│   ├── ar.json
│   └── en.json
├── types/
│   ├── database.ts
│   └── index.ts
├── public/
│   ├── navbar.png
│   ├── logo.png
│   └── booktfly-logo-symbol.png
├── supabase-migration.sql
├── middleware.ts
└── .env.local
```

---

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the database migration
Paste the contents of `supabase-migration.sql` into your **Supabase SQL Editor** and run it.

### 4. Start the dev server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## User Roles

| Role | Access |
|---|---|
| `buyer` | Browse trips, book seats, manage own bookings |
| `provider` | All buyer access + provider dashboard, trip management, revenue |
| `admin` | Full platform access including all management tools |

New users are assigned the `buyer` role by default. Providers are promoted after their application is approved by an admin.
