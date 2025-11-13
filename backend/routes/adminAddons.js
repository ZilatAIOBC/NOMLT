const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../utils/supabase');
const { auth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/billing/addons
 * Admin-only: fetch list of addon prices (e.g. Uncensored Mode)
 */
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('addon_prices')
            .select('id, addon_key, price, currency, label, is_active, metadata, created_at, updated_at')
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch add-on pricing',
                details: error.message,
            });
        }

        return res.json({
            success: true,
            addons: data || [],
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Unexpected error while fetching add-ons',
        });
    }
});

router.put('/change-price/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (id === undefined || id === null) {
            return res.status(400).json({
                error: 'Addon id is required',
            });
        }

        if (price === undefined || price === null) {
            return res.status(400).json({
                error: 'price is required',
            });
        }

        if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
            return res.status(400).json({
                error: 'price must be a non-negative number',
            });
        }

        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('addon_prices')
            .update({
                price,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select('id, addon_key, price, currency, label, is_active, metadata, created_at, updated_at')
            .single();

        if (error) {
            return res.status(500).json({
                error: 'Failed to update add-on price',
                details: error.message,
            });
        }

        if (!data) {
            return res.status(404).json({
                error: 'Addon not found',
            });
        }

        return res.json({
            success: true,
            message: 'Add-on price updated successfully',
            addon: data,
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Unexpected error while updating add-on price',
        });
    }
});

/**
 * GET /api/admin/addons/:id
 * Admin-only: fetch a single addon by ID
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const client = supabaseAdmin || supabase;

        const { data, error } = await client
            .from('addon_prices')
            .select(
                'id, addon_key, price, currency, label, is_active, metadata, created_at, updated_at'
            )
            .eq('id', id)
            .single();

        if (error) {
            return res.status(500).json({
                error: 'Failed to fetch addon details',
                details: error.message,
            });
        }

        if (!data) {
            return res.status(404).json({ error: 'Addon not found' });
        }

        return res.json({
            success: true,
            addon: data,
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Unexpected error while fetching addon details',
        });
    }
});


module.exports = router;