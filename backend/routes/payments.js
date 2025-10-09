const express = require('express');
const router = express.Router();
const { createCheckoutSession, retrieveCheckoutSession } = require('../services/stripeService');

// Helper: resolve frontend URL
function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, interval, userId, isUpgrade } = req.body;
    if (!planId || !interval || !userId) {
      return res.status(400).json({ error: 'Missing planId, interval, or userId' });
    }
    const successUrl = `${getFrontendUrl()}/dashboard/billing`;
    const cancelUrl = `${getFrontendUrl()}/dashboard/billing?canceled=true`;
    const session = await createCheckoutSession({ 
      userId, 
      planId, 
      interval, 
      successUrl, 
      cancelUrl,
      isUpgrade: isUpgrade || false
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/payments/checkout-session?session_id=...
router.get('/checkout-session', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session_id' });
    }
    const session = await retrieveCheckoutSession(sessionId);
    return res.status(200).json({ session });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;


