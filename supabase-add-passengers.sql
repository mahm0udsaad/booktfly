-- Add passengers JSONB column to bookings table
-- Add is_direct boolean column to trips table
-- Run this in Supabase SQL Editor

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS passengers jsonb DEFAULT NULL;

ALTER TABLE trips
ADD COLUMN IF NOT EXISTS is_direct boolean DEFAULT true;

COMMENT ON COLUMN bookings.passengers IS 'Array of passenger objects: [{first_name, middle_name, last_name, date_of_birth, nationality, visa_type}]';
COMMENT ON COLUMN trips.is_direct IS 'Whether the flight is direct (no stops)';
