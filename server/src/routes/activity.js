const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// GET /api/activity
router.get('/activity', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const { data: events, error } = await supabase
      .from('usage_events')
      .select('id, event_type, channel, cost, description, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return next(error);

    // Session total = sum of costs from today's events
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString();

    const { data: todayEvents, error: todayError } = await supabase
      .from('usage_events')
      .select('cost')
      .gte('created_at', todayStart);
    if (todayError) return next(todayError);

    const sessionTotal = (todayEvents || []).reduce((sum, e) => sum + parseFloat(e.cost || 0), 0);

    res.json({
      events: events || [],
      sessionTotal,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
