const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const billingEngine = require('../services/billingEngine');

const DEFAULT_SENDERS = [
  'customer@gmail.com',
  'support@acme.co',
  'dev@startup.io',
  'hello@company.com',
  'user@example.com',
];

const DEFAULT_BODIES = [
  'Hey, just checking in on our recent order. Can you provide an update?',
  'I wanted to follow up on the support ticket I submitted last week.',
  'Quick question — do you offer bulk pricing for enterprise accounts?',
  'Thanks for the onboarding call today. Looking forward to getting started.',
  'I noticed a discrepancy in my invoice. Could you take a look?',
  'Your API documentation is really well written. Great work!',
  'When will the new features be available in the dashboard?',
  'We are interested in a partnership. Who should I contact?',
];

// GET /api/inbox
router.get('/inbox', async (req, res, next) => {
  try {
    const { status = 'all', channel = 'all', limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status !== 'all') {
      if (status === 'unread') {
        query = query.eq('status', 'delivered');
      } else {
        query = query.eq('status', status);
      }
    }

    if (channel !== 'all') {
      query = query.eq('channel', channel);
    }

    const { data: messages, error, count } = await query;
    if (error) return next(error);

    // Get counts for all inbound messages
    const { data: allInbound, error: countError } = await supabase
      .from('messages')
      .select('status')
      .eq('direction', 'inbound');
    if (countError) return next(countError);

    const counts = {
      unread: allInbound.filter(m => m.status === 'delivered').length,
      read: allInbound.filter(m => m.status === 'read').length,
      archived: allInbound.filter(m => m.status === 'archived').length,
    };

    // Log inbox pull billing event
    const { pullCost } = await billingEngine.processInboxPull();

    res.json({
      messages: messages || [],
      total: count || 0,
      pullCost,
      counts,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/inbox/:id
router.patch('/inbox/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'status must be "read" or "archived"' });
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, status, updated_at')
      .single();

    if (error) return next(error);
    if (!data) return res.status(404).json({ error: 'NOT_FOUND', message: 'Message not found' });

    res.json({ message: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/simulate-inbound
router.post('/simulate-inbound', async (req, res, next) => {
  try {
    const sender = req.body.sender || DEFAULT_SENDERS[Math.floor(Math.random() * DEFAULT_SENDERS.length)];
    const body = req.body.body || DEFAULT_BODIES[Math.floor(Math.random() * DEFAULT_BODIES.length)];

    const { data, error } = await supabase
      .from('messages')
      .insert({
        direction: 'inbound',
        channel: 'email',
        recipient: 'inbox@opencourier.dev',
        sender,
        body,
        status: 'delivered',
        cost: 0,
      })
      .select()
      .single();

    if (error) return next(error);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
