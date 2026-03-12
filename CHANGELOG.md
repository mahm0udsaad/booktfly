# BookitFly - Platform Improvements Changelog

## Database Migration Applied
- Applied full `supabase-migration.sql` to Supabase project
- Created all 7 tables: profiles, provider_applications, providers, trips, bookings, notifications, platform_settings
- Enabled RLS on all tables with comprehensive policies
- Created enums, triggers (`updated_at`, `handle_new_user`), functions (`book_seats`, `release_seats`, `expire_past_trips`, `cleanup_failed_payments`)
- Set up storage buckets: `provider-documents`, `trip-images`, `avatars` with RLS policies
- Created performance indexes across all tables
- Configured pg_cron jobs (expire trips hourly, cleanup failed payments every 15 min)
- Seeded platform_settings with default 10% commission rate

## Seed Data
- Created a test provider (Golden Travel Co. / شركة السفر الذهبي) linked to existing user
- Seeded 8 active trips with realistic Saudi/MENA routes:
  - Riyadh → Jeddah (Economy, 450 SAR)
  - Jeddah → Cairo (Economy, Round trip, 1,200 SAR)
  - Riyadh → Dubai (Business, 2,800 SAR)
  - Jeddah → Madinah (Economy, 350 SAR, nearly sold out)
  - Riyadh → Istanbul (Economy, Round trip, 1,850 SAR)
  - Dammam → Jeddah (First Class, 4,500 SAR)
  - Jeddah → Kuala Lumpur (Economy, Round trip, 3,200 SAR)
  - Riyadh → London (Business, Round trip, 7,500 SAR)

---

## 1. SEO Metadata & OG Tags

### Files Modified
- `app/[locale]/layout.tsx` — Added `metadataBase`, OpenGraph defaults (type, siteName, locale, images), Twitter card config, robots directives

### Files Created
- `app/[locale]/trips/[id]/trip-detail-client.tsx` — Extracted client component from trip detail page
- `app/[locale]/trips/[id]/page.tsx` — Refactored as server component with `generateMetadata` that fetches trip data (route, airline, price, date, OG image)
- `app/[locale]/trips/layout.tsx` — Static metadata for trips listing page
- `app/robots.ts` — Blocks crawling of `/api/`, `/admin/`, `/provider/`, `/checkout/`, `/my-bookings/`, `/auth/`
- `app/sitemap.ts` — Dynamic sitemap with static pages (both locales) + all active trip URLs

---

## 2. Rate Limiting

### Files Created
- `lib/rate-limit.ts` — In-memory IP-based rate limiter with configurable limits and time windows; returns 429 with `Retry-After` header

### Files Modified
- `app/api/bookings/route.ts` — 5 req/min
- `app/api/bookings/[id]/confirm/route.ts` — 5 req/min
- `app/api/providers/apply/route.ts` — 3 req/min
- `app/api/providers/reapply/route.ts` — 3 req/min
- `app/api/trips/route.ts` — GET: 30 req/min, POST: 10 req/min

---

## 3. Image Optimization

### Dependencies Added
- `sharp` — High-performance image processing library

### Files Created
- `lib/optimize-image.ts` — Resizes images to max 1200×1200 (without upscaling), converts to WebP at 80% quality

### Files Modified
- `app/api/trips/route.ts` — Trip creation now optimizes uploaded images before storage
- `app/api/trips/[id]/route.ts` — Trip updates now optimize uploaded images before storage

---

## 4. Error Handling UX

### Files Created
- `app/global-error.tsx` — Root-level error boundary (bilingual fallback UI)
- `app/[locale]/error.tsx` — Locale-aware error boundary with retry button and home link
- `app/[locale]/not-found.tsx` — 404 page with links to home and trip browsing
- `app/not-found.tsx` — Root 404 fallback page

### Files Modified
- `messages/en.json` — Added `common.retry` translation key
- `messages/ar.json` — Added `common.retry` translation key

---

## 5. Real-time Notification Sound & Toast

### Files Created
- `lib/notification-sound.ts` — Two-tone chime using Web Audio API (no external audio files needed)

### Files Modified
- `hooks/use-notifications.ts` — On new real-time notification: plays sound alert and shows toast popup with notification title/body (only for new notifications, not on initial page load)

---

## 6. Search Autocomplete

### Files Created
- `app/api/trips/cities/route.ts` — Returns deduplicated city list (AR name, EN name, IATA code) from active trips, cached 5 minutes
- `components/shared/city-autocomplete.tsx` — Reusable autocomplete dropdown with city names in both languages and IATA codes, client-side cached

### Files Modified
- `app/[locale]/trips/page.tsx` — Replaced plain origin/destination inputs with `CityAutocomplete` component
- `components/home/hero-section.tsx` — Replaced plain search inputs with `CityAutocomplete` component
