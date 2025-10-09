# 🔧 Webhook Test Guide

## Current Status ✅

- ✅ Backend server: Running on port 5000
- ✅ Webhook secret: Set in backend .env
- ✅ Webhook endpoint: `/api/webhooks/stripe`
- ✅ Stripe CLI: Now running and forwarding webhooks

## Test the Complete Flow

### 1. Make Sure Stripe CLI is Running
The Stripe CLI should be running in a terminal with output like:
```
> Ready! Your webhook signing secret is whsec_...
> Listening for events...
```

### 2. Test a New Subscription
1. **Go to your Purchase Subscriptions page**
2. **Click "Get Started" on Basic Plan (Monthly)**
3. **Complete payment** with test card: `4242 4242 4242 4242`
4. **Watch the Stripe CLI terminal** - you should see webhook events

### 3. What You Should See

**In Stripe CLI terminal:**
```
2025-10-08 12:50:00   --> checkout.session.completed [evt_...]
2025-10-08 12:50:00   --> customer.subscription.created [evt_...]
```

**In your backend server logs:**
```
Received Stripe webhook event: checkout.session.completed
Processing checkout.session.completed: cs_test_...
Successfully saved subscription to database: {...}
```

**In your database:**
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```
Should show your new subscription record.

### 4. Verify on Billing Page
- Should show "Basic Plan" instead of dummy data
- Should show real billing date
- Should show "Active" status

## Troubleshooting

### If No Webhook Events in Stripe CLI:
1. Make sure Stripe CLI is logged in: `stripe login`
2. Check the webhook URL is correct: `http://localhost:5000/api/webhooks/stripe`
3. Verify your backend server is running on port 5000

### If Webhook Events But No Database Records:
1. Check backend server logs for errors
2. Verify database connection
3. Check webhook secret matches

### If Still Getting 404 Errors:
1. Restart backend server: `npm start`
2. Check if webhook route is loaded
3. Verify API endpoint: `http://localhost:5000/api/webhooks/stripe`

## Expected Webhook Events

When you complete a subscription, you should see these events:
1. `checkout.session.completed` - Payment completed
2. `customer.subscription.created` - Subscription created
3. `invoice.payment_succeeded` - Payment processed

## Test Again

Now that Stripe CLI is running, try the subscription flow again:
1. Complete a new payment
2. Watch for webhook events
3. Check database for new records
4. Verify billing page shows real data

---

**Status**: Ready to test with webhook forwarding active
