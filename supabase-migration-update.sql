-- ============================================================
-- BookitFly Migration: Trip Edit Requests, Cancellation Flow,
-- One-Way Price, Booking Type
-- ============================================================

-- 1. Add price_per_seat_one_way to trips
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS price_per_seat_one_way NUMERIC(10,2) DEFAULT NULL;

-- 2. Add booking_type to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'round_trip'
CHECK (booking_type IN ('one_way', 'round_trip'));

-- 3. Add cancellation_pending to booking status
-- (If using enum, alter it; if using text with check, update the check)
-- Assuming status is text, we just need to make sure the check constraint allows it.
-- Drop existing check if any and recreate:
DO $$
BEGIN
  -- Try to drop existing constraint (may not exist)
  BEGIN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- If status is an enum type, add the new value:
DO $$
BEGIN
  -- Check if booking_status is an enum type
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    BEGIN
      ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancellation_pending';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- 4. Create trip_edit_requests table
CREATE TABLE IF NOT EXISTS trip_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  changes JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trip_edit_requests_status ON trip_edit_requests(status);
CREATE INDEX IF NOT EXISTS idx_trip_edit_requests_trip_id ON trip_edit_requests(trip_id);

-- 5. RLS policies for trip_edit_requests
ALTER TABLE trip_edit_requests ENABLE ROW LEVEL SECURITY;

-- Admin can read all
CREATE POLICY "admin_read_trip_edit_requests" ON trip_edit_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Provider can read their own
CREATE POLICY "provider_read_own_trip_edit_requests" ON trip_edit_requests
  FOR SELECT TO authenticated
  USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- Provider can insert their own
CREATE POLICY "provider_insert_trip_edit_requests" ON trip_edit_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

-- 6. Create release_seats function if not exists
CREATE OR REPLACE FUNCTION release_seats(p_trip_id UUID, p_seats INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE trips
  SET booked_seats = GREATEST(0, booked_seats - p_seats),
      status = CASE
        WHEN status = 'sold_out' THEN 'active'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = p_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
