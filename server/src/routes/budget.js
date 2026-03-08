const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { getCurrentBudgetStatus } = require('../services/billingEngine');

// GET /api/budget
router.get('/budget', async (req, res, next) => {
  try {
    const { budget, currentSpend } = await getCurrentBudgetStatus();
    const percent = budget.limit_amount > 0 ? currentSpend / parseFloat(budget.limit_amount) : 0;

    res.json({
      budget: {
        id: budget.id,
        limit_amount: budget.limit_amount,
        period: budget.period,
        alert_at_75: budget.alert_at_75,
        alert_at_90: budget.alert_at_90,
        hard_stop_at_100: budget.hard_stop_at_100,
      },
      consumed: {
        amount: currentSpend,
        percent,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/budget
router.post('/budget', async (req, res, next) => {
  try {
    const { limit_amount, alert_at_75, alert_at_90, hard_stop_at_100 } = req.body;

    // Get existing budget id
    const { data: existing, error: fetchError } = await supabase
      .from('budgets')
      .select('id')
      .limit(1)
      .single();
    if (fetchError) return next(fetchError);

    const updates = {};
    if (limit_amount !== undefined) updates.limit_amount = limit_amount;
    if (alert_at_75 !== undefined) updates.alert_at_75 = alert_at_75;
    if (alert_at_90 !== undefined) updates.alert_at_90 = alert_at_90;
    if (hard_stop_at_100 !== undefined) updates.hard_stop_at_100 = hard_stop_at_100;
    updates.updated_at = new Date().toISOString();

    const { data: updatedBudget, error: updateError } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    if (updateError) return next(updateError);

    const { currentSpend } = await getCurrentBudgetStatus();
    const percent = updatedBudget.limit_amount > 0 ? currentSpend / parseFloat(updatedBudget.limit_amount) : 0;

    res.json({
      budget: {
        id: updatedBudget.id,
        limit_amount: updatedBudget.limit_amount,
        period: updatedBudget.period,
        alert_at_75: updatedBudget.alert_at_75,
        alert_at_90: updatedBudget.alert_at_90,
        hard_stop_at_100: updatedBudget.hard_stop_at_100,
      },
      consumed: {
        amount: currentSpend,
        percent,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
