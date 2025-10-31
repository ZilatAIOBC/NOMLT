// backend/config/creditPacks.js
// Minimal in-code definition of credit packs for top-ups

const CURRENCY = process.env.CREDITS_CURRENCY || 'usd';

// unitAmount is in the smallest currency unit (e.g., cents for USD)
const CREDIT_PACKS = {
  // $5 → 7,000 credits
  small: { credits: 7000, unitAmount: 500, name: '7,000 Credits Pack' },
  // $20 → 15,000 credits
  medium: { credits: 15000, unitAmount: 2000, name: '15,000 Credits Pack' },
  // $30 → 18,000 credits
  large: { credits: 18000, unitAmount: 3000, name: '18,000 Credits Pack' },
};

function getCreditPack(packId) {
  return CREDIT_PACKS[packId] || null;
}

module.exports = {
  CURRENCY,
  CREDIT_PACKS,
  getCreditPack,
};


