const supabase = require('../config/supabase');
const rates = require('../config/rates');

function getPeriodStart(period) {
  const now = new Date();
  switch (period) {
    case 'daily': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      return start.toISOString();
    }
    case 'weekly': {
      const day = now.getUTCDay(); // 0 = Sunday
      const daysToMonday = (day === 0 ? 6 : day - 1);
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday));
      return start.toISOString();
    }
    case 'monthly':
    default: {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      return start.toISOString();
    }
  }
}

function getCostForChannel(channel) {
  switch (channel) {
    case 'email': return rates.RATE_EMAIL_SEND;
    case 'slack': return rates.RATE_SLACK_SEND;
    default: return 0;
  }
}

async function getBudget() {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

async function getCurrentPeriodSpend(periodStart) {
  const { data, error } = await supabase
    .from('usage_events')
    .select('cost')
    .gte('created_at', periodStart);
  if (error) throw error;
  const total = (data || []).reduce((sum, row) => sum + parseFloat(row.cost || 0), 0);
  return total;
}

async function processSend(messageId, channel, recipient) {
  const cost = getCostForChannel(channel);

  const { error: insertError } = await supabase
    .from('usage_events')
    .insert({
      event_type: 'send',
      channel,
      cost,
      message_id: messageId,
      description: `${channel} sent to ${recipient}`,
    });
  if (insertError) throw insertError;

  const budget = await getBudget();
  const periodStart = getPeriodStart(budget.period);
  const totalSpend = await getCurrentPeriodSpend(periodStart);
  const percentUsed = budget.limit_amount > 0 ? totalSpend / parseFloat(budget.limit_amount) : 0;

  const alerts = [];
  if (budget.alert_at_75 && percentUsed >= 0.75) {
    alerts.push({ type: 'warning', threshold: 75 });
  }
  if (budget.alert_at_90 && percentUsed >= 0.90) {
    alerts.push({ type: 'critical', threshold: 90 });
  }

  return { cost, totalSpend, budgetPercent: percentUsed, alerts };
}

async function processInboxPull() {
  const { error } = await supabase
    .from('usage_events')
    .insert({
      event_type: 'inbox_pull',
      channel: 'system',
      cost: rates.RATE_INBOX_PULL,
      description: 'Inbox checked',
    });
  if (error) throw error;
  return { pullCost: rates.RATE_INBOX_PULL };
}

async function getCurrentBudgetStatus() {
  const budget = await getBudget();
  const periodStart = getPeriodStart(budget.period);
  const currentSpend = await getCurrentPeriodSpend(periodStart);
  const percentUsed = budget.limit_amount > 0 ? currentSpend / parseFloat(budget.limit_amount) : 0;
  return { budget, currentSpend, percentUsed };
}

module.exports = {
  processSend,
  processInboxPull,
  getCurrentBudgetStatus,
  getPeriodStart,
  getCostForChannel,
};
