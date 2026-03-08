const supabase = require('./supabase');
const rates = require('./rates');

// Generate a date N days ago from now, with optional hour offset
function daysAgo(n, hour = 12) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

async function checkAndSeed() {
  const { data, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('[Seed] Error checking messages count:', error.message);
    return;
  }

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  if (count < 5) {
    console.log('[Seed] Less than 5 messages found. Running seed...');
    await seed();
  } else {
    console.log(`[Seed] ${count} messages found. Skipping seed.`);
  }
}

async function seed() {
  console.log('[Seed] Clearing existing data...');

  // Delete in FK order
  await supabase.from('usage_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Reset budget
  await supabase
    .from('budgets')
    .update({
      limit_amount: 10.00,
      period: 'monthly',
      alert_at_75: true,
      alert_at_90: true,
      hard_stop_at_100: false,
      updated_at: new Date().toISOString(),
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('[Seed] Inserting seed messages...');

  // 15 messages: ~10 outbound, ~5 inbound, spread over 10-14 days
  const messageSeedData = [
    // Outbound emails
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'alice@test.com',
      subject: 'API Integration Update',
      body: 'Hi Alice, just wanted to let you know the API integration is live. Let us know if you have any questions.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(14, 9),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'bob@company.co',
      subject: 'Weekly Report',
      body: 'Hi Bob, please find attached the weekly usage report. Highlights: 42 sends, 98% delivery rate.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(13, 10),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'support@acme.io',
      subject: 'Quick Question',
      body: 'Hey team, do you have documentation for the v2 endpoints? We need to upgrade our integration.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(12, 14),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'dev@startup.com',
      subject: 'Meeting Follow-up',
      body: 'Thanks for the call today. I have sent over the sandbox credentials as promised.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(11, 11),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'hello@example.org',
      subject: 'Bug Report',
      body: 'We identified a minor bug in the webhook retry logic. A patch has been deployed.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(10, 16),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'alice@test.com',
      subject: 'Re: API Integration Update',
      body: 'Great to hear! We have processed 200 messages in the first 24 hours with zero failures.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(9, 10),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'ops@bigcorp.net',
      subject: 'Onboarding Complete',
      body: 'Your OpenCourier account is fully configured. Dashboard access has been granted.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(8, 9),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'bob@company.co',
      subject: 'Invoice #1042',
      body: 'Please find your invoice for this billing period attached. Total: $9.87. Payment due in 30 days.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(7, 14),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'dev@startup.com',
      subject: 'New Feature: Pull Inbox',
      body: 'Exciting news — our Pull Inbox feature is now available. No webhooks needed. Try it today!',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(5, 11),
    },
    {
      direction: 'outbound',
      channel: 'email',
      recipient: 'hello@example.org',
      subject: 'Usage Alert',
      body: 'You have reached 75% of your monthly budget. Consider upgrading your plan.',
      status: 'delivered',
      cost: rates.RATE_EMAIL_SEND,
      created_at: daysAgo(3, 13),
    },
    // Inbound emails
    {
      direction: 'inbound',
      channel: 'email',
      recipient: 'inbox@opencourier.dev',
      sender: 'alice@test.com',
      subject: 'Re: API Integration Update',
      body: 'This is fantastic! We are already seeing great throughput. Any plans for batch sending?',
      status: 'read',
      cost: 0,
      created_at: daysAgo(13, 15),
    },
    {
      direction: 'inbound',
      channel: 'email',
      recipient: 'inbox@opencourier.dev',
      sender: 'customer@gmail.com',
      subject: null,
      body: 'Hi, I would like to know more about your enterprise pricing. Can someone reach out?',
      status: 'archived',
      cost: 0,
      created_at: daysAgo(10, 10),
    },
    {
      direction: 'inbound',
      channel: 'email',
      recipient: 'inbox@opencourier.dev',
      sender: 'dev@startup.com',
      subject: 'Re: Meeting Follow-up',
      body: 'Got the credentials, thanks! We are integrating now. Will share results by end of week.',
      status: 'read',
      cost: 0,
      created_at: daysAgo(8, 16),
    },
    {
      direction: 'inbound',
      channel: 'email',
      recipient: 'inbox@opencourier.dev',
      sender: 'user@example.com',
      subject: null,
      body: 'Just wanted to say the pull inbox feature is a game changer. No more webhook headaches!',
      status: 'delivered',
      cost: 0,
      created_at: daysAgo(4, 9),
    },
    {
      direction: 'inbound',
      channel: 'email',
      recipient: 'inbox@opencourier.dev',
      sender: 'support@acme.co',
      subject: 'Feature Request',
      body: 'Would love to see SMS support added. We have customers who prefer text messages.',
      status: 'delivered',
      cost: 0,
      created_at: daysAgo(1, 11),
    },
  ];

  const { data: insertedMessages, error: msgError } = await supabase
    .from('messages')
    .insert(messageSeedData)
    .select();

  if (msgError) {
    console.error('[Seed] Error inserting messages:', msgError.message);
    return;
  }

  console.log(`[Seed] Inserted ${insertedMessages.length} messages.`);

  // Build usage events for outbound messages
  const outboundMessages = insertedMessages.filter(m => m.direction === 'outbound');
  const sendEvents = outboundMessages.map(m => ({
    event_type: 'send',
    channel: m.channel,
    cost: m.cost,
    message_id: m.id,
    description: `${m.channel} sent to ${m.recipient}`,
    created_at: m.created_at,
  }));

  // Historical usage events to reach ~$6.50 total spend
  // We have 10 sends at $0.001 = $0.01
  // We need ~$6.49 more from historical aggregate events
  // Strategy: spread ~50 historical events with varied costs over 10-14 days
  // Daily targets (to look natural on a chart): $0.30-$0.80/day
  // Historical events scaled so total spend across all seed data ≈ $6.50 (65% of $10 budget).
  // 28 historical send events sum to ~$6.46, plus 28 inbox_pulls ($0.006) + 10 real sends ($0.01) ≈ $6.48
  const historicalEvents = [
    // Day 14
    { event_type: 'send', channel: 'email', cost: 0.24, description: 'Email sent to alice@test.com', created_at: daysAgo(14, 8) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(14, 8) },
    { event_type: 'send', channel: 'email', cost: 0.16, description: 'Email sent to bob@company.co', created_at: daysAgo(14, 15) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(14, 15) },
    // Day 13
    { event_type: 'send', channel: 'email', cost: 0.32, description: 'Email sent to dev@startup.com', created_at: daysAgo(13, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(13, 9) },
    { event_type: 'send', channel: 'email', cost: 0.18, description: 'Email sent to ops@bigcorp.net', created_at: daysAgo(13, 16) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(13, 16) },
    // Day 12
    { event_type: 'send', channel: 'email', cost: 0.28, description: 'Email sent to alice@test.com', created_at: daysAgo(12, 10) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(12, 10) },
    { event_type: 'send', channel: 'email', cost: 0.13, description: 'Email sent to hello@example.org', created_at: daysAgo(12, 14) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(12, 14) },
    // Day 11
    { event_type: 'send', channel: 'email', cost: 0.37, description: 'Email sent to support@acme.io', created_at: daysAgo(11, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(11, 9) },
    { event_type: 'send', channel: 'email', cost: 0.21, description: 'Email sent to bob@company.co', created_at: daysAgo(11, 15) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(11, 15) },
    // Day 10
    { event_type: 'send', channel: 'email', cost: 0.30, description: 'Email sent to dev@startup.com', created_at: daysAgo(10, 11) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(10, 11) },
    { event_type: 'send', channel: 'email', cost: 0.17, description: 'Email sent to alice@test.com', created_at: daysAgo(10, 17) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(10, 17) },
    // Day 9
    { event_type: 'send', channel: 'email', cost: 0.26, description: 'Email sent to hello@example.org', created_at: daysAgo(9, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(9, 9) },
    { event_type: 'send', channel: 'email', cost: 0.21, description: 'Email sent to ops@bigcorp.net', created_at: daysAgo(9, 14) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(9, 14) },
    // Day 8
    { event_type: 'send', channel: 'email', cost: 0.34, description: 'Email sent to support@acme.io', created_at: daysAgo(8, 10) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(8, 10) },
    { event_type: 'send', channel: 'email', cost: 0.19, description: 'Email sent to bob@company.co', created_at: daysAgo(8, 16) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(8, 16) },
    // Day 7
    { event_type: 'send', channel: 'email', cost: 0.27, description: 'Email sent to dev@startup.com', created_at: daysAgo(7, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(7, 9) },
    { event_type: 'send', channel: 'email', cost: 0.19, description: 'Email sent to alice@test.com', created_at: daysAgo(7, 15) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(7, 15) },
    // Day 6
    { event_type: 'send', channel: 'email', cost: 0.30, description: 'Email sent to hello@example.org', created_at: daysAgo(6, 11) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(6, 11) },
    { event_type: 'send', channel: 'email', cost: 0.16, description: 'Email sent to ops@bigcorp.net', created_at: daysAgo(6, 16) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(6, 16) },
    // Day 5
    { event_type: 'send', channel: 'email', cost: 0.35, description: 'Email sent to support@acme.io', created_at: daysAgo(5, 10) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(5, 10) },
    { event_type: 'send', channel: 'email', cost: 0.11, description: 'Email sent to bob@company.co', created_at: daysAgo(5, 15) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(5, 15) },
    // Day 4
    { event_type: 'send', channel: 'email', cost: 0.25, description: 'Email sent to dev@startup.com', created_at: daysAgo(4, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(4, 9) },
    { event_type: 'send', channel: 'email', cost: 0.21, description: 'Email sent to alice@test.com', created_at: daysAgo(4, 14) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(4, 14) },
    // Day 3
    { event_type: 'send', channel: 'email', cost: 0.28, description: 'Email sent to hello@example.org', created_at: daysAgo(3, 10) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(3, 10) },
    { event_type: 'send', channel: 'email', cost: 0.18, description: 'Email sent to ops@bigcorp.net', created_at: daysAgo(3, 16) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(3, 16) },
    // Day 2
    { event_type: 'send', channel: 'email', cost: 0.22, description: 'Email sent to support@acme.io', created_at: daysAgo(2, 11) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(2, 11) },
    { event_type: 'send', channel: 'email', cost: 0.15, description: 'Email sent to bob@company.co', created_at: daysAgo(2, 15) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(2, 15) },
    // Day 1
    { event_type: 'send', channel: 'email', cost: 0.26, description: 'Email sent to dev@startup.com', created_at: daysAgo(1, 9) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(1, 9) },
    { event_type: 'send', channel: 'email', cost: 0.17, description: 'Email sent to alice@test.com', created_at: daysAgo(1, 14) },
    { event_type: 'inbox_pull', channel: 'system', cost: 0.0002, description: 'Inbox checked', created_at: daysAgo(1, 14) },
  ];

  const allEvents = [...sendEvents, ...historicalEvents];

  const { error: eventsError } = await supabase
    .from('usage_events')
    .insert(allEvents);

  if (eventsError) {
    console.error('[Seed] Error inserting usage events:', eventsError.message);
    return;
  }

  // Calculate total spend for logging
  const totalHistorical = historicalEvents.reduce((sum, e) => sum + e.cost, 0);
  const totalSendEvents = sendEvents.reduce((sum, e) => sum + e.cost, 0);
  console.log(`[Seed] Inserted ${allEvents.length} usage events. Approx total spend: $${(totalHistorical + totalSendEvents).toFixed(2)}`);
  console.log('[Seed] Seed complete.');
}

async function resetSeed() {
  console.log('[Seed] Reset requested...');
  await seed();
}

module.exports = { checkAndSeed, resetSeed };
