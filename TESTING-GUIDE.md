# Testing Guide — Bank Transfer Payment + Wallet System

This guide covers all new features added in this update. Test each section in order.

## Prerequisites

- Dev server running: `pnpm dev` (port 3001)
- Supabase project connected with migrations applied
- At least one admin user, one provider user, and one buyer user
- Provider must have at least one active trip with available seats

---

## 1. Admin: Bank Info Settings

1. Log in as **admin**
2. Go to `/admin/settings`
3. Verify the **Bank Account Details** section exists with fields: IBAN, Bank Name (AR/EN), Account Holder (AR/EN)
4. Verify seeded data is pre-filled:
   - IBAN: `SA0380000000608010167519`
   - Bank Name EN: `Al Rajhi Bank` / AR: `بنك الراجحي`
   - Account Holder EN: `BooktFly LLC` / AR: `شركة بوكت فلاي`
5. Change the IBAN to something else, click Save, refresh the page — verify it persists
6. Revert to original IBAN

**Expected:** All fields save and load correctly.

---

## 2. Provider: IBAN in Profile

1. Log in as **provider**
2. Go to provider profile/settings page
3. Verify the **Bank Account (IBAN)** field exists under contact info
4. Enter a valid IBAN (e.g. `SA0380000000608010167519`), save
5. Refresh — verify IBAN persists

**Expected:** IBAN is saved to the `providers` table.

---

## 3. Booking + Bank Transfer Checkout Flow

### 3.1 Create a Booking

1. Log in as **buyer** (or test as guest)
2. Browse trips, select an active trip with available seats
3. Fill passenger details, submit booking
4. **Verify redirect** goes to `/checkout/{bookingId}` (NOT `/my-bookings/{bookingId}`)

### 3.2 Checkout Page — Bank Transfer

1. On the checkout page, verify:
   - Order summary shows correct price, seats, total
   - Bank details section shows IBAN, bank name, account holder (in current locale)
   - IBAN has a **copy button** — click it, verify clipboard has the IBAN
   - Account holder has a copy button
   - Amount to transfer shows the total with a copy button
   - Receipt upload section exists with "Optional" label
2. **Without uploading receipt:** click "Confirm Transfer Completed"
3. Verify state changes to **"Transfer Confirmation Received"** with pending review message
4. Verify booking reference is shown

### 3.3 Checkout with Receipt Upload

1. Create another booking → go to checkout
2. Upload a receipt image (any screenshot/image file)
3. Verify image preview appears with an X button to remove
4. Click "Confirm Transfer Completed"
5. Verify success state

### 3.4 Verify Booking Status

1. Go to `/my-bookings/{bookingId}` for the first booking (no receipt)
2. Verify it shows **"Transfer confirmed, pending admin review"** message
3. Go to `/my-bookings/{bookingId}` for the second booking (with receipt)
4. Verify the **transfer receipt image** is displayed

### 3.5 Verify Booking in Database

Run in Supabase SQL Editor:
```sql
SELECT id, status, transfer_confirmed_at, transfer_receipt_url, paid_at
FROM bookings ORDER BY created_at DESC LIMIT 5;
```
- `status` should be `payment_processing`
- `transfer_confirmed_at` should be set
- `transfer_receipt_url` should be set for the second booking
- `paid_at` should be NULL

---

## 4. Admin: Approve/Reject Payment

### 4.1 Approve a Payment

1. Log in as **admin**
2. Go to `/admin/bookings`
3. Find the booking with `payment_processing` status
4. Click into booking detail
5. Verify:
   - Transfer receipt image is displayed (if uploaded)
   - "Review Bank Transfer" section with approve/reject buttons
   - Transfer confirmed timestamp is shown
6. Click **"Approve Payment"**
7. Verify booking status changes to `confirmed`

### 4.2 Verify Wallet Credit

Run in Supabase SQL Editor:
```sql
SELECT pw.balance, wt.*
FROM provider_wallets pw
LEFT JOIN wallet_transactions wt ON wt.provider_id = pw.provider_id
WHERE pw.provider_id = '<provider_id>'
ORDER BY wt.created_at DESC;
```
- Wallet should exist with balance = `provider_payout` amount
- Transaction record should exist with type `credit`

### 4.3 Verify Notifications

- **Buyer** should receive a notification: "Payment confirmed, booking confirmed"
- **Provider** should receive a notification: "New confirmed booking" with wallet credit info

### 4.4 Reject a Payment

1. Create another booking, confirm transfer
2. As admin, go to the booking detail
3. Enter a rejection reason in the text field (e.g. "Transfer not found in bank statement")
4. Click **"Reject Payment"**
5. Verify booking status changes to `payment_failed`

### 4.5 Verify Rejection on Buyer Side

1. Log in as **buyer**
2. Go to `/my-bookings/{rejectedBookingId}`
3. Verify:
   - Red "Transfer Rejected" section is shown
   - Rejection reason is displayed
   - "Try Again" button links to checkout page
4. Click "Try Again" — verify checkout page loads (buyer can re-attempt)

### 4.6 Verify Seats Released

After rejection, check the trip:
```sql
SELECT id, booked_seats, total_seats FROM trips WHERE id = '<trip_id>';
```
`booked_seats` should have decreased by the rejected booking's seat count.

---

## 5. My Bookings — Payment States

Test that `/my-bookings/{id}` displays correctly for each status:

| Status | Expected UI |
|--------|-------------|
| `payment_processing` (no `transfer_confirmed_at`) | "Awaiting Bank Transfer" with "Complete Payment" link to checkout |
| `payment_processing` (with `transfer_confirmed_at`) | "Transfer confirmed, pending admin review" |
| `payment_failed` | "Transfer Rejected" with reason + "Try Again" link |
| `confirmed` | Normal confirmed view with cancel option |
| `cancellation_pending` | Pending cancellation message |

---

## 6. Provider: Wallet & Revenue Page

1. Log in as **provider** (the one who had a booking approved in step 4.1)
2. Go to `/provider/revenue`
3. Verify:
   - **Wallet balance card** (dark gradient) shows the credited amount
   - **Transaction history** section shows the credit entry with description
   - Revenue cards (gross, commission, net) show data from confirmed bookings
   - Per-trip breakdown table is intact

---

## 7. Provider: Request Withdrawal

### 7.1 Request a Withdrawal

1. On the revenue page, click **"Request Withdrawal"**
2. Enter an amount (must be ≤ wallet balance)
3. Click **"Confirm"**
4. Verify:
   - Success toast appears
   - Withdrawal form disappears
   - "Withdrawal pending review" badge appears
   - Withdrawal requests table shows the new request with `pending` status

### 7.2 Validation Checks

1. Try requesting another withdrawal while one is pending — should get error "You already have a pending withdrawal request"
2. Try requesting an amount > balance — should get "Insufficient balance" error
3. If provider has no IBAN set, they should get "Please add your IBAN in your profile first"

---

## 8. Admin: Withdrawal Management

### 8.1 View Withdrawals

1. Log in as **admin**
2. Verify **"Withdrawals"** link exists in admin sidebar (with Banknote icon)
3. Go to `/admin/withdrawals`
4. Verify:
   - Table shows the pending withdrawal with provider name, amount, IBAN, status, date
   - Filter buttons work (All, Pending, Completed, Rejected)

### 8.2 Approve Withdrawal

1. Click **"Approve"** on the pending withdrawal
2. Verify status changes to `completed`
3. Check provider wallet:
   ```sql
   SELECT balance FROM provider_wallets WHERE provider_id = '<provider_id>';
   ```
   Balance should have decreased by the withdrawal amount
4. Check wallet transactions — should have a new `withdrawal` type entry
5. Provider should receive a notification about approval

### 8.3 Reject Withdrawal (test with a new withdrawal)

1. Provider creates another withdrawal request
2. Admin enters a comment, clicks **"Reject"**
3. Verify status changes to `rejected`
4. Provider balance should NOT change
5. Provider receives rejection notification with comment

---

## 9. Refund/Cancel — Wallet Debit

### 9.1 Refund a Confirmed Booking

1. As admin, go to a confirmed booking (that was previously approved via bank transfer)
2. Click **"Refund"**
3. Verify:
   - Booking status → `refunded`
   - Provider wallet balance decreased by `provider_payout`
   - New `debit` transaction in `wallet_transactions`
   - Seats released back to trip

### 9.2 Cancel a Confirmed Booking

1. Have a buyer request cancellation on a confirmed booking
2. As admin, approve the cancellation
3. Verify same wallet debit behavior as refund

---

## 10. Edge Cases

- [ ] **Guest booking (not logged in):** Book as guest → checkout should work without auth, receipt upload should work
- [ ] **Locale switching:** Switch between AR/EN on checkout page — bank details should show in correct language
- [ ] **Multiple seats:** Book 3+ seats, verify total amount calculation on checkout
- [ ] **Trip with no seats left:** Should not be able to book (existing validation)
- [ ] **Admin approves booking for provider with no wallet yet:** Wallet should be auto-created (upsert in `credit_wallet` RPC)
- [ ] **Concurrent bookings:** Two buyers book the last seats simultaneously — `book_seats` RPC should handle race condition

---

## 11. Database Integrity Checks

Run after completing all tests:

```sql
-- All confirmed bookings should have paid_at set
SELECT id FROM bookings WHERE status = 'confirmed' AND paid_at IS NULL;
-- Should return 0 rows (except legacy bookings)

-- Wallet balance should match sum of transactions
SELECT pw.provider_id, pw.balance,
  (SELECT balance_after FROM wallet_transactions
   WHERE provider_id = pw.provider_id ORDER BY created_at DESC LIMIT 1) AS last_tx_balance
FROM provider_wallets pw;
-- balance and last_tx_balance should match

-- No negative wallet balances
SELECT * FROM provider_wallets WHERE balance < 0;
-- Should return 0 rows

-- All completed withdrawals should have reviewed_by and reviewed_at
SELECT id FROM withdrawal_requests WHERE status = 'completed' AND (reviewed_by IS NULL OR reviewed_at IS NULL);
-- Should return 0 rows
```
