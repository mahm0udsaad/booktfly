# BooktFly Platform Evolution Plan
## "Last Minute" Travel Marketplace + Cars + Enhanced Notifications

### Architecture Summary
- **Framework**: Next.js 16 + Tailwind CSS v4 + Supabase + Resend
- **Theme**: Primary `#0c4a6e` (navy) + Accent `#f97316` (orange) + Success/Warning/Destructive tokens
- **Email**: React Email components + Resend via `lib/notifications.ts`
- **i18n**: next-intl (ar/en) with RTL support
- **Existing Roles**: buyer, provider, admin, marketeer
- **Existing Listings**: flights (trips table), rooms (rooms table)

---

## PHASE 1: Core Infrastructure (Foundation for all agents)

### Step 1.1: Database Migration — Last-Minute System + Cars
**File**: New Supabase migration via MCP

```sql
-- Add last-minute fields to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_last_minute boolean DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2) DEFAULT 0;

-- Add last-minute fields to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_last_minute boolean DEFAULT false;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2) DEFAULT 0;

-- Create cars table (mirroring rooms pattern)
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) NOT NULL,
  brand_ar text NOT NULL,
  brand_en text,
  model_ar text NOT NULL,
  model_en text,
  year integer NOT NULL,
  city_ar text NOT NULL,
  city_en text,
  category text NOT NULL, -- sedan, suv, luxury, van, economy
  price_per_day numeric NOT NULL,
  currency text DEFAULT 'SAR',
  seats_count integer DEFAULT 5,
  transmission text DEFAULT 'automatic', -- automatic, manual
  fuel_type text DEFAULT 'petrol', -- petrol, diesel, electric, hybrid
  features text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  available_from date,
  available_to date,
  instant_book boolean DEFAULT true,
  is_last_minute boolean DEFAULT false,
  original_price numeric,
  discount_percentage numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active',
  removed_reason text,
  removed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create car_bookings table (mirroring room_bookings pattern)
CREATE TABLE IF NOT EXISTS car_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) NOT NULL,
  buyer_id uuid REFERENCES profiles(id),
  provider_id uuid REFERENCES providers(id) NOT NULL,
  booked_by_marketeer_id uuid,
  guest_token text,
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  pickup_date date NOT NULL,
  return_date date NOT NULL,
  number_of_days integer NOT NULL,
  price_per_day numeric NOT NULL,
  total_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  provider_payout numeric NOT NULL,
  status text DEFAULT 'payment_processing',
  transfer_receipt_url text,
  transfer_confirmed_at timestamptz,
  payment_reviewed_by uuid,
  payment_reviewed_at timestamptz,
  payment_rejection_reason text,
  paid_at timestamptz,
  refunded_at timestamptz,
  refunded_by uuid,
  cancelled_at timestamptz,
  cancelled_by uuid,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create last_minute_notifications table (tracks what alerts were sent)
CREATE TABLE IF NOT EXISTS last_minute_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type text NOT NULL, -- 'trip', 'room', 'car'
  listing_id uuid NOT NULL,
  notified_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE last_minute_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for cars (same pattern as rooms)
CREATE POLICY "Public can read active cars" ON cars FOR SELECT USING (status = 'active');
CREATE POLICY "Providers manage own cars" ON cars FOR ALL USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- RLS policies for car_bookings (same pattern as room_bookings)
CREATE POLICY "Buyers read own car bookings" ON car_bookings FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Providers read own car bookings" ON car_bookings FOR SELECT USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
```

### Step 1.2: TypeScript Types Update
**File**: `types/database.ts`

Add:
- `Car` type (mirrors `Room` with car-specific fields)
- `CarBooking` type (mirrors `RoomBooking`)
- `CarStatus = 'active' | 'deactivated' | 'removed'`
- `CarCategory = 'sedan' | 'suv' | 'luxury' | 'van' | 'economy'`
- `TransmissionType = 'automatic' | 'manual'`
- `FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid'`
- Update `NotificationType` to add: `'last_minute_deal'`, `'last_minute_provider_alert'`, `'car_booking_confirmed'`, `'car_booking_rejected'`, `'car_removed'`, `'new_car_booking'`
- Update `ActivityEventType` to add: `'car_created'`, `'car_removed'`, `'car_booking_created'`, `'car_booking_confirmed'`
- Extend `Trip` and `Room` types with `is_last_minute`, `original_price`, `discount_percentage`

### Step 1.3: Constants Update
**File**: `lib/constants.ts`

Add:
- `LAST_MINUTE_THRESHOLD_HOURS = 72`
- `CAR_CATEGORIES` (sedan, SUV, luxury, van, economy — AR/EN)
- `CAR_FEATURES` (GPS, Bluetooth, cruise control, etc. — AR/EN)
- `CAR_STATUS_COLORS` (same pattern as ROOM_STATUS_COLORS)
- `CAR_BOOKING_STATUS_COLORS` (same pattern)
- `TRANSMISSION_TYPES` (automatic, manual — AR/EN)
- `FUEL_TYPES` (petrol, diesel, electric, hybrid — AR/EN)

### Step 1.4: i18n Messages Update
**Files**: `messages/ar.json`, `messages/en.json`

Add new keys under:
- `lastMinute.*` — "Last Minute Deals", "Hurry! Departing in X hours", countdown labels
- `cars.*` — all car-related labels, form fields, booking flow text
- `notifications.last_minute_*` — notification title/body templates
- `home.last_minute_section` — homepage section title

---

## PHASE 2: AGENT 1 — Buyer Journey (Highest Priority)

### Step 2.1: Last-Minute Detection Utility
**File**: New `lib/last-minute.ts`

```typescript
export function isLastMinute(departureAt: string): boolean {
  const departure = new Date(departureAt)
  const now = new Date()
  const hoursUntil = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntil > 0 && hoursUntil <= LAST_MINUTE_THRESHOLD_HOURS
}

export function getUrgencyLevel(departureAt: string): 'high' | 'medium' | 'low' | null {
  const hours = hoursUntilDeparture(departureAt)
  if (hours <= 0) return null
  if (hours <= 12) return 'high'
  if (hours <= 24) return 'medium'
  if (hours <= 72) return 'low'
  return null
}

export function hoursUntilDeparture(departureAt: string): number {
  return (new Date(departureAt).getTime() - Date.now()) / (1000 * 60 * 60)
}
```

### Step 2.2: Countdown Timer Component
**File**: New `components/ui/countdown-timer.tsx`

A client component that:
- Takes a `targetDate` prop
- Displays live countdown: "2d 14h 32m"
- Uses `useEffect` with `setInterval` every 60 seconds
- Color-coded: red (<12h), orange (<24h), amber (<72h)
- Pulsing animation when <6h
- Bilingual display (AR/EN)

### Step 2.3: Last-Minute Badge Component
**File**: New `components/ui/last-minute-badge.tsx`

- Displays fire icon + "Last Minute" text
- Shows discount % if available
- Animated gradient border (orange to red)
- Compact variant for cards, large variant for detail pages

### Step 2.4: Update Trip Card with Last-Minute Features
**File**: `components/trips/trip-card.tsx`

Modifications:
- Import `isLastMinute`, `getUrgencyLevel`, `hoursUntilDeparture` from `lib/last-minute.ts`
- Compute `const lastMinute = isLastMinute(trip.departure_at)` at top of component
- After `<TripStatusBadge>` (line 70), conditionally render `<LastMinuteBadge>`
- In the meta pills section (line 115), add a third pill showing countdown if last-minute
- In the seats indicator section: if remaining seats < 3, show "Only X left!" in red text
- In the footer price section: if `trip.discount_percentage > 0`, show original price crossed out + discounted price in orange

### Step 2.5: Update Room Card with Last-Minute Features
**File**: `components/rooms/room-card.tsx`

Same pattern as trip card:
- Countdown timer for `available_to` if within 72h window
- Last-minute badge overlay on the image
- Original price crossed out if discounted

### Step 2.6: New Car Card Component
**File**: New `components/cars/car-card.tsx`

Following the room card pattern:
- Image area with category badge overlay
- Car brand + model + year
- Meta pills: seats, transmission, fuel type
- Features row (first 4)
- Price per day + CTA arrow
- Last-minute badge support

### Step 2.7: "Last Minute Deals" Homepage Section
**File**: New `components/home/last-minute-deals.tsx`

- Query: trips where `departure_at` is within 72h AND `status = 'active'` AND seats available
- Query: rooms where `available_from` is within 72h AND `status = 'active'`
- Horizontal scrollable carousel with countdown timers
- Fire icon header animation
- Show mixed results (flights + rooms + cars) sorted by urgency
- Only appears if there are last-minute deals (hide section if empty)

**File**: `app/[locale]/page.tsx` — Add `<LastMinuteDeals>` section right after `<HeroSection>` (before StatsSection)

### Step 2.8: Cars Listing Page
**File**: New `app/[locale]/cars/page.tsx`

Following `app/[locale]/rooms/page.tsx` pattern:
- Search filters: city, dates (pickup/return), category, price range, transmission, fuel
- Sort by: newest, price_asc, price_desc
- Grid of CarCard components
- Load more pagination

### Step 2.9: Car Detail Page
**File**: New `app/[locale]/cars/[id]/page.tsx`

Following `app/[locale]/rooms/[id]/page.tsx` pattern:
- Image gallery
- Car specs (brand, model, year, transmission, fuel, features)
- Price per day + availability calendar
- Provider info card
- "Book Now" CTA

### Step 2.10: Car Booking Page
**File**: New `app/[locale]/cars/[id]/book/page.tsx`

Following room booking pattern:
- Pickup/return date selection
- Contact info form
- Price breakdown (days * price_per_day)
- Submit -> create booking -> redirect to checkout

### Step 2.11: Cars API Routes
**Files**: New API routes following rooms pattern:
- `app/api/cars/route.ts` — GET (list with filters) + POST (provider create)
- `app/api/cars/[id]/route.ts` — GET (single car detail)
- `app/api/cars/[id]/deactivate/route.ts` — POST (provider deactivate)
- `app/api/cars/my-cars/route.ts` — GET (provider's own cars)
- `app/api/car-bookings/route.ts` — POST (create booking)
- `app/api/car-bookings/[id]/route.ts` — GET (booking detail)
- `app/api/car-bookings/[id]/confirm/route.ts` — POST (upload receipt)
- `app/api/car-bookings/[id]/cancel/route.ts` — POST (cancel booking)
- `app/api/car-bookings/mine/route.ts` — GET (buyer's bookings)
- `app/api/car-bookings/provider/route.ts` — GET (provider's bookings)

### Step 2.12: Receipt Email Template
**File**: New `emails/payment-receipt.tsx`

Following `emails/booking-confirmed.tsx` pattern:
- Includes: booking ref, trip/room/car details, passenger info, price breakdown
- Shows commission-free total for buyer
- "Thank you for your purchase" header
- Payment method display
- QR code placeholder for e-ticket

### Step 2.13: Last-Minute Deal Email Template
**File**: New `emails/last-minute-deal.tsx`

- Urgent header with fire emoji styling
- "Departing in X hours!" countdown text
- Trip/room/car summary card
- Discount badge if applicable
- One-click "Book Now" CTA button linking to listing page
- Unsubscribe footer

### Step 2.14: Send Receipt Email on Booking Confirmation
**File**: `app/api/admin/bookings/[id]/approve-payment/route.ts` (and room/car equivalents)

After approving payment, add email sending:
```typescript
import PaymentReceipt from '@/emails/payment-receipt'
import { render } from '@react-email/render'

// After status update to 'confirmed'
const html = await render(PaymentReceipt({ ...bookingDetails }))
await notify({
  userId: booking.buyer_id,
  type: 'booking_confirmed',
  // ... existing notification
  email: {
    subject: `Payment Receipt - BooktFly #${ref}`,
    html,
  },
})
```

### Step 2.15: Update Navigation
**File**: `components/layout/navbar.tsx` (or header component)

- Add "Cars" link next to "Flights" and "Rooms" in the main navigation
- Add "Last Minute" tab/link with a fire icon badge
- Update mobile navigation accordingly

### Step 2.16: Buyer My-Bookings for Cars
**File**: New `app/[locale]/my-bookings/cars/[id]/page.tsx`

Following existing `my-bookings/rooms/[id]/page.tsx` pattern:
- Car booking detail view
- Status tracking
- Cancel/receipt upload options

---

## PHASE 3: AGENT 2 — Marketeer Journey

### Step 3.1: Bulk Email Campaigns
**File**: New `app/api/marketeers/bulk-email/route.ts`

- POST: Accept { subject, body, recipientEmails[] }
- Uses Resend batch API (`resend.batch.send`)
- Rate limit: 3 campaigns per hour
- Tracks sent count in marketeer dashboard

### Step 3.2: Customer List Upload
**File**: New `app/api/marketeers/customers/route.ts`

- POST: Accept CSV/Excel file upload
- Parse file (use `xlsx` package) to extract: name, email, phone
- Store in `marketeer_customers` table (new migration)
- GET: Return marketeer's customer list with pagination

### Step 3.3: Marketeer Customers DB Table
**Migration**:
```sql
CREATE TABLE IF NOT EXISTS marketeer_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marketeer_id uuid REFERENCES marketeers(id) NOT NULL,
  name text,
  email text,
  phone text,
  source text DEFAULT 'manual', -- 'manual', 'excel', 'referral'
  created_at timestamptz DEFAULT now()
);
```

### Step 3.4: Marketeer Bulk Email UI
**File**: New `app/[locale]/marketeer/campaigns/page.tsx`

- "New Campaign" button
- Template selection (last-minute deals, custom)
- Customer list selector (select all, by segment)
- Rich text editor for email body
- Preview + Send flow
- Campaign history with open/click stats (future)

### Step 3.5: Customer List Management UI
**File**: New `app/[locale]/marketeer/customers/page.tsx`

- Upload Excel/CSV button
- Manual add customer form
- Customer table with search
- Delete/edit customers
- Import history

### Step 3.6: Auto-Forward Last-Minute Deals
**File**: Update `lib/last-minute.ts`

Add function: `notifyMarketeersOfLastMinuteDeal(listing)`
- Queries all active marketeers with customer lists
- Sends each marketeer an in-app notification
- Marketeer can then choose to forward to their customer list via bulk email

### Step 3.7: Marketeer Cars Booking
**File**: Update `app/api/marketeers/book/route.ts`

- Currently handles flight bookings
- Extend to support `booking_type: 'car'` alongside existing trip bookings
- Same commission tracking and guest token flow

### Step 3.8: Update Marketeer Sidebar
**File**: `components/layout/marketeer-sidebar.tsx`

Add new nav items:
- "Customers" (Users icon)
- "Campaigns" (Send icon)

---

## PHASE 4: AGENT 3 — Service Provider Journey

### Step 4.1: Flash Offer Creation
**File**: New `app/[locale]/provider/trips/[id]/flash-offer/page.tsx`

A quick form that:
- Shows current trip details
- Lets provider set discount % (10-50%)
- Calculates new price automatically
- Sets `is_last_minute = true`, `original_price = current price`, `discount_percentage = entered %`
- Updates the trip via PATCH API

### Step 4.2: Provider Cars Management
**File**: New `app/[locale]/provider/cars/page.tsx`

Following `provider/rooms/page.tsx` pattern:
- List of provider's cars
- Status badges
- Booking counts
- Add/Edit/Deactivate

### Step 4.3: Provider New Car Form
**File**: New `app/[locale]/provider/cars/new/page.tsx`

Following `provider/rooms/new/page.tsx` pattern:
- Brand/model/year fields
- Category selector
- Specs: transmission, fuel, seats
- Features checkboxes
- Image upload (multiple)
- Pricing + availability dates
- Submit creates car via API

### Step 4.4: Provider Car Bookings
**File**: New `app/[locale]/provider/car-bookings/page.tsx`

Following `provider/room-bookings/page.tsx` pattern:
- Incoming car booking requests
- Approve/reject actions
- Status filters

### Step 4.5: Auto-Notification for Last-Minute Trips
**File**: New `app/api/cron/last-minute-check/route.ts`

A cron endpoint (called by Vercel Cron or external scheduler):
- Queries trips with `departure_at` within 72h that are NOT yet marked `is_last_minute`
- Marks them as `is_last_minute = true`
- Sends provider notification: "Your trip [X] is now in last-minute zone. Consider offering a discount!"
- Sends buyer notifications for subscribers
- Inserts record in `last_minute_notifications` to avoid duplicate alerts
- Same logic for rooms approaching their `available_to` date

### Step 4.6: Provider Last-Minute Dashboard Widget
**File**: Update `app/[locale]/provider/dashboard/page.tsx`

Add a new card:
- "Last Minute Trips" count
- "Suggested Action: Create a flash offer to fill remaining seats"
- Quick-link to flash offer creation

### Step 4.7: Provider Cars Sidebar Link
**File**: Update `components/layout/provider-sidebar.tsx`

Add:
- "Cars" nav item (Car icon) linking to `/provider/cars`
- "Car Bookings" nav item

---

## PHASE 5: AGENT 4 — Admin Journey

### Step 5.1: Admin Cars Management
**File**: New `app/[locale]/admin/cars/page.tsx`

Following `admin/rooms/page.tsx` pattern:
- All cars listing with filters
- Remove/moderate cars
- View provider info

### Step 5.2: Admin Car Bookings Management
**File**: New `app/[locale]/admin/car-bookings/page.tsx` + `[id]/page.tsx`

Following `admin/room-bookings/` pattern:
- All car bookings with status filters
- Approve/reject payments
- Refund actions

### Step 5.3: Admin Car Booking APIs
**Files**:
- `app/api/admin/cars/route.ts` — GET (all cars)
- `app/api/admin/cars/[id]/remove/route.ts` — POST (remove car)
- `app/api/admin/car-bookings/route.ts` — GET (all car bookings)
- `app/api/admin/car-bookings/[id]/approve-payment/route.ts` — POST
- `app/api/admin/car-bookings/[id]/refund/route.ts` — POST
- `app/api/admin/car-bookings/[id]/approve-cancel/route.ts` — POST

### Step 5.4: Last-Minute Dashboard
**File**: Update `app/[locale]/admin/page.tsx`

Add new dashboard cards:
- "Active Last-Minute Deals" count
- "Last-Minute Bookings Today" count
- "Revenue from Last-Minute" SAR amount
- Chart: Last-minute conversion rate over time

### Step 5.5: Admin Last-Minute Settings
**File**: Update `app/[locale]/admin/settings/page.tsx`

Add configurable settings:
- Last-minute threshold (default: 72h)
- Max discount percentage allowed
- Auto-notification toggle
- Store in `platform_settings` table (add columns)

### Step 5.6: Admin Sidebar Updates
**File**: Update `components/layout/admin-sidebar.tsx`

Add new nav items:
- "Cars" section with Cars + Car Bookings links
- "Last Minute" link to filtered dashboard view

---

## Execution Order

```
Phase 1 (Foundation)          ← Do first, all agents depend on this
  ├── 1.1 DB Migration
  ├── 1.2 Types
  ├── 1.3 Constants
  └── 1.4 i18n

Phase 2 (Buyer)               ← Do second, highest user impact
  ├── 2.1-2.3 Components (countdown, badge, util)
  ├── 2.4-2.5 Update existing cards
  ├── 2.6-2.10 Cars UI (card, listing, detail, booking)
  ├── 2.11 Cars API routes
  ├── 2.12-2.13 Email templates
  ├── 2.14 Receipt email on confirmation
  └── 2.15-2.16 Navigation + My-Bookings

Phase 3 (Marketeer)           ← Do third, growth channel
  ├── 3.1-3.3 Bulk email + customer list backend
  ├── 3.4-3.5 Campaign + customer list UI
  ├── 3.6 Auto-forward last-minute
  ├── 3.7 Cars booking support
  └── 3.8 Sidebar update

Phase 4 (Provider)            ← Do fourth, supply side
  ├── 4.1 Flash offer creation
  ├── 4.2-4.4 Cars management + bookings
  ├── 4.5 Cron job for auto-detection
  ├── 4.6 Dashboard widget
  └── 4.7 Sidebar update

Phase 5 (Admin)               ← Do fifth, control plane
  ├── 5.1-5.3 Cars admin pages + APIs
  ├── 5.4 Last-minute dashboard
  ├── 5.5 Settings
  └── 5.6 Sidebar update
```

## File Count Estimate
- **New files**: ~35 (pages, API routes, components, email templates)
- **Modified files**: ~15 (types, constants, i18n, existing cards, navigation, admin/provider dashboards)
- **DB migration**: 1 migration with multiple table/column additions
