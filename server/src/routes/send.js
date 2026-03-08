const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const channelRouter = require('../services/channelRouter');
const billingEngine = require('../services/billingEngine');
const budgetGuard = require('../middleware/budgetGuard');
const rates = require('../config/rates');

function getRateForChannel(channel) {
  switch (channel) {
    case 'email': return rates.RATE_EMAIL_SEND;
    case 'slack': return rates.RATE_SLACK_SEND;
    default: return 0;
  }
}

router.post('/send', budgetGuard, async (req, res, next) => {
  const { channel, recipient, body, subject } = req.body;

  // Validate
  if (!channel || !['email', 'slack'].includes(channel)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'channel must be "email" or "slack"' });
  }
  if (!recipient) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'recipient is required' });
  }
  if (!body) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'body is required' });
  }

  const cost = getRateForChannel(channel);

  // Insert message row
  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      direction: 'outbound',
      channel,
      recipient,
      subject: subject || null,
      body,
      status: 'queued',
      cost,
    })
    .select()
    .single();

  if (insertError) {
    return next(insertError);
  }

  try {
    // Send via channel router
    await channelRouter.sendMessage(channel, { recipient, subject, body });

    // Process billing
    const billing = await billingEngine.processSend(message.id, channel, recipient);

    // Status progression
    const messageId = message.id;

    setTimeout(async () => {
      await supabase
        .from('messages')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', messageId);
    }, 1000);

    setTimeout(async () => {
      await supabase
        .from('messages')
        .update({ status: 'delivered', updated_at: new Date().toISOString() })
        .eq('id', messageId);
    }, 3500);

    return res.status(201).json({
      message: {
        id: message.id,
        status: message.status,
        channel: message.channel,
        cost: message.cost,
        created_at: message.created_at,
      },
      billing: {
        totalSpend: billing.totalSpend,
        budgetPercent: billing.budgetPercent,
        alerts: billing.alerts,
      },
    });
  } catch (sendError) {
    // Mark message as failed
    await supabase
      .from('messages')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', message.id);

    // Log send_failed usage event
    await supabase
      .from('usage_events')
      .insert({
        event_type: 'send_failed',
        channel,
        cost: 0,
        message_id: message.id,
        description: `${channel} send failed to ${recipient}: ${sendError.message}`,
      });

    return res.status(500).json({
      error: 'SEND_FAILED',
      message: sendError.message,
      charged: false,
    });
  }
});

module.exports = router;
