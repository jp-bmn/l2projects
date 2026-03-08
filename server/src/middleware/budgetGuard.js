const { getCurrentBudgetStatus, getCostForChannel } = require('../services/billingEngine');

async function budgetGuard(req, res, next) {
  try {
    const { channel } = req.body;
    const projectedCost = getCostForChannel(channel);

    const { budget, currentSpend } = await getCurrentBudgetStatus();

    if (budget.hard_stop_at_100 && (currentSpend + projectedCost) > parseFloat(budget.limit_amount)) {
      return res.status(402).json({
        error: 'BUDGET_EXCEEDED',
        message: 'Monthly budget reached. Disable hard stop or increase budget.',
        currentSpend,
        budgetLimit: parseFloat(budget.limit_amount),
      });
    }

    // Attach any threshold warnings so the route can include them in the response
    const alerts = [];
    const totalAfter = currentSpend + projectedCost;
    const percentAfter = budget.limit_amount > 0 ? totalAfter / parseFloat(budget.limit_amount) : 0;
    if (budget.alert_at_75 && percentAfter >= 0.75) alerts.push({ type: 'warning', threshold: 75 });
    if (budget.alert_at_90 && percentAfter >= 0.90) alerts.push({ type: 'critical', threshold: 90 });

    req.budgetWarnings = alerts;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = budgetGuard;
