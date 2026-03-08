const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { getPeriodStart } = require('../services/billingEngine');

// GET /api/usage
router.get('/usage', async (req, res, next) => {
  try {
    // Get budget period
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('period')
      .limit(1)
      .single();
    if (budgetError) return next(budgetError);

    const periodStart = getPeriodStart(budget.period);
    const now = new Date();
    const periodEnd = now.toISOString().split('T')[0];

    const { data: events, error } = await supabase
      .from('usage_events')
      .select('event_type, channel, cost')
      .gte('created_at', periodStart);
    if (error) return next(error);

    let currentSpend = 0;
    let messagesSent = 0;
    let inboxPulls = 0;
    const byChannel = {
      email: { count: 0, cost: 0 },
      slack: { count: 0, cost: 0 },
      inbox_pull: { count: 0, cost: 0 },
    };

    for (const event of events || []) {
      const cost = parseFloat(event.cost || 0);
      currentSpend += cost;

      if (event.event_type === 'send') {
        messagesSent++;
        const ch = event.channel;
        if (byChannel[ch]) {
          byChannel[ch].count++;
          byChannel[ch].cost += cost;
        }
      } else if (event.event_type === 'inbox_pull') {
        inboxPulls++;
        byChannel.inbox_pull.count++;
        byChannel.inbox_pull.cost += cost;
      }
    }

    res.json({
      currentSpend,
      messagesSent,
      inboxPulls,
      byChannel,
      period: {
        start: periodStart.split('T')[0],
        end: periodEnd,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/usage/history
router.get('/usage/history', async (req, res, next) => {
  try {
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('period')
      .limit(1)
      .single();
    if (budgetError) return next(budgetError);

    const periodStart = getPeriodStart(budget.period);

    const { data: events, error } = await supabase
      .from('usage_events')
      .select('event_type, cost, created_at')
      .gte('created_at', periodStart)
      .order('created_at', { ascending: true });
    if (error) return next(error);

    // Group by date in JS
    const byDate = {};
    for (const event of events || []) {
      const date = event.created_at.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { date, spend: 0, sends: 0, pulls: 0 };
      }
      byDate[date].spend += parseFloat(event.cost || 0);
      if (event.event_type === 'send') byDate[date].sends++;
      if (event.event_type === 'inbox_pull') byDate[date].pulls++;
    }

    const history = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
