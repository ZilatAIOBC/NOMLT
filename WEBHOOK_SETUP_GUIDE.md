# 🔧 Webhook Setup Guide - Fix Database Issue

## Problem Identified ✅

1. **Authentication Error**: Billing API couldn't authenticate user
2. **Database Issue**: Subscription data wasn't being saved to database after Stripe checkout

## Issues Fixed ✅

### 1. Authentication Fixed
- Updated `subscriptionService.ts` to include user ID in API calls
- Fixed "User not authenticated" error

### 2. Database Integration Added
- Created webhook handler (`backend/routes/webhooks.js`)
- Added route to `backend/app.js`
- Now saves subscription data to database when Stripe checkout completes

## Setup Required

### Step 1: Add Webhook Secret to Backend

Add to your `backend/.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 2: Set Up Webhook in Stripe Dashboard

**Option A: Using Stripe CLI (Recommended for Development)**

```bash
# Install and login to Stripe CLI
stripe login

# Start webhook listener
stripe listen --forward-to http://localhost:5000/api/webhooks/stripe

# Copy the webhook secret (whsec_...) shown in terminal
# Add it to backend/.env as STRIPE_WEBHOOK_SECRET
```

**Option B: Using ngrok (Alternative)**

1. Start ngrok: `ngrok http 5000`
2. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
3. Click "Add endpoint"
4. Endpoint URL: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
6. Copy the webhook signing secret to `backend/.env`

### Step 3: Restart Backend Server

```bash
cd /home/admin123/Desktop/Minibyte/NOMLT/backend
npm start
```

## How It Works Now

### Complete Flow
```
1. User clicks "Get Started" → Creates Stripe Checkout Session
2. User completes payment on Stripe
3. Stripe sends webhook to your backend
4. Backend saves subscription to database
5. User redirected to Billing page
6. Billing page fetches real subscription data
7. Shows actual plan details ✅
```

### Webhook Events Handled
- `checkout.session.completed` → Saves subscription to database
- `customer.subscription.updated` → Updates subscription status
- `customer.subscription.deleted` → Marks subscription as canceled
- `invoice.payment_succeeded` → Handles successful payments

## Test the Complete Flow

### 1. Set Up Webhook (Required)
- Use Stripe CLI or ngrok method above
- Add webhook secret to backend `.env`
- Restart backend server

### 2. Test Payment Flow
1. Go to Purchase Subscriptions page
2. Click "Get Started" on Basic Plan (Monthly)
3. Complete payment with test card: `4242 4242 4242 4242`
4. Should redirect to Billing page
5. Should show "Basic Plan" subscription ✅

### 3. Verify Database
Check your Supabase `subscriptions` table:
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

Should see your subscription record with:
- `user_id`: Your user ID
- `plan_id`: Basic plan ID
- `stripe_subscription_id`: Stripe subscription ID
- `status`: 'active'

## Expected Results

### Before Fix
- ❌ "User not authenticated" error
- ❌ Empty subscriptions table
- ❌ Billing page shows dummy data

### After Fix
- ✅ Authentication works
- ✅ Subscription saved to database
- ✅ Billing page shows real "Basic Plan" data
- ✅ Shows actual billing date and status

## Files Added/Updated

- ✅ `backend/routes/webhooks.js` (new)
- ✅ `backend/app.js` (updated)
- ✅ `frontend/src/services/subscriptionService.ts` (updated)
- ✅ `frontend/src/pages/Dashboard/Billing.tsx` (updated)

## Troubleshooting

### "User not authenticated" Error
- ✅ Fixed by updating subscriptionService.ts
- Make sure you're logged in

### "Webhook signature verification failed"
- Check that `STRIPE_WEBHOOK_SECRET` is correct
- Restart backend server after adding webhook secret

### Subscription not in database
- Check webhook is set up correctly
- Check backend logs for webhook events
- Verify webhook URL is accessible

### Billing page still shows dummy data
- Check browser console for errors
- Verify user is logged in
- Check that subscription exists in database

## Next Steps After Setup

1. **Test the complete flow** with a new subscription
2. **Verify database** has subscription records
3. **Check billing page** shows real data
4. **Set up webhooks for production** when ready to go live

---

**Status**: Ready to test with webhook setup
**Last Updated**: October 8, 2025
