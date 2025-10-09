# 🚀 Quick Setup Guide - Stripe Integration

## ✅ Completed Steps

1. ✅ Created Stripe products and prices in dashboard
2. ✅ Added Stripe price IDs to database
3. ✅ Installed backend dependencies (`stripe`)
4. ✅ Installed frontend dependencies (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
5. ✅ Implemented backend Stripe integration
6. ✅ Implemented frontend payment UI

## 📝 Next Steps

### Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **Test mode** (toggle at top right)
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### Step 2: Configure Backend Environment

Add to `backend/.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### Step 3: Configure Frontend Environment

Add to `frontend/.env`:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:5000
```

### Step 4: Start Your Servers

**Backend:**
```bash
cd /home/admin123/Desktop/Minibyte/NOMLT/backend
npm start
# Should run on http://localhost:5000
```

**Frontend:**
```bash
cd /home/admin123/Desktop/Minibyte/NOMLT/frontend
npm run dev
# Should run on http://localhost:5173
```

### Step 5: Test the Payment Flow

1. **Sign in** to your application as a regular user
2. Navigate to **Purchase Subscriptions** page
3. Select a billing cycle (Monthly or Yearly)
4. Click **"Get Started"** on any plan
5. You'll be redirected to Stripe Checkout

### Step 6: Complete Test Payment

Use Stripe test cards:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/25` (any future date)
- CVC: `123` (any 3 digits)
- ZIP: `12345` (any valid zip)

**Other Test Cards:**
- Declined: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Step 7: Verify Success

After completing payment:
1. You'll be redirected to the **Billing** page
2. A success toast notification will appear: "Subscription activated successfully! 🎉"
3. Check your Stripe Dashboard → Payments to see the test payment

## 🎯 Your Plans Setup

You have 3 subscription plans configured:

### Basic Plan
- Monthly: $4.25
- Yearly: $35.69
- Stripe Product: `prod_TBa79XgxqKNxTB`

### Standard Plan ⭐ Most Popular
- Monthly: $14.17
- Yearly: $119.99
- Stripe Product: `prod_TBaCeuUmcjcMph`

### Pro Plan 💎 Special Offer
- Monthly: $70.82
- Yearly: $601.00
- Stripe Product: `prod_TBaG3IUmPLDXC4`

## 🔍 Troubleshooting

### "Missing STRIPE_SECRET_KEY" Error
- Make sure you added `STRIPE_SECRET_KEY` to `backend/.env`
- Restart your backend server after adding the key

### "Failed to create checkout session" Error
- Check that your backend is running on port 5000
- Check that `VITE_API_BASE_URL` is set correctly in `frontend/.env`
- Check browser console for detailed error messages

### "Please sign in to purchase a subscription" Error
- Make sure you're logged in
- Check localStorage for `authUser` data

### Checkout Page Not Loading
- Verify your Stripe keys are correct (test mode keys for testing)
- Check Stripe Dashboard logs for API errors
- Check browser console for errors

### Payment Not Redirecting Back
- Verify `FRONTEND_URL` is set correctly in `backend/.env`
- Check that your frontend is running on the URL you specified

## 📊 Monitoring

### Backend Logs
Watch for these log messages:
```
Supabase connected
Server started on port: 5000
API: POST /api/payments/create-checkout-session - Status: 200
```

### Stripe Dashboard
Monitor these sections:
- **Payments** - See all test transactions
- **Customers** - See created customers
- **Subscriptions** - See active subscriptions
- **Logs** - See API requests

## 🎨 User Flow

```
User clicks "Get Started"
         ↓
Frontend validates user is logged in
         ↓
Frontend calls POST /api/payments/create-checkout-session
         ↓
Backend creates/retrieves Stripe customer
         ↓
Backend creates Stripe Checkout Session
         ↓
Frontend redirects to Stripe Checkout URL
         ↓
User enters payment details on Stripe
         ↓
Stripe processes payment
         ↓
Stripe redirects to: /dashboard/billing?session_id=xxx
         ↓
Frontend verifies payment status
         ↓
Show success message 🎉
```

## ⚠️ Important Notes

1. **Test Mode Only**: Use test mode keys for development
2. **No Webhooks Yet**: Subscription renewals won't auto-update (will add later)
3. **Manual DB Updates**: You'll need to manually update subscription status in DB (webhook will automate this later)
4. **Test Cards Only**: Real cards won't work in test mode

## 🚀 Ready for Production?

When you're ready to go live:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **Live API keys**
3. Update your `.env` files with live keys
4. Set up **webhooks** for production
5. Test with a real (small amount) payment
6. Deploy to production servers
7. Update `FRONTEND_URL` to production domain

## 📚 Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com)

## ✅ Success Checklist

- [ ] Backend `.env` has `STRIPE_SECRET_KEY`
- [ ] Backend `.env` has `FRONTEND_URL`
- [ ] Frontend `.env` has `VITE_API_BASE_URL`
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access Purchase Subscriptions page
- [ ] Can click "Get Started" button
- [ ] Redirects to Stripe Checkout
- [ ] Can complete test payment
- [ ] Redirects back to Billing page
- [ ] Success message appears

---

**Need Help?** Check the logs and Stripe Dashboard for detailed error information.

