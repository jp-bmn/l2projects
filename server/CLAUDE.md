# CLAUDE.md — OpenCourier Backend (server/)

## Project Overview
OpenCourier is a developer-first messaging platform cloning Twilio's core sending capability with two improvements: a Pull Inbox (webhook-free message retrieval) and a Billing Intelligence Dashboard (real-time usage tracking). This file covers the Express API server.

## Tech Stack
- **Runtime:** Node.js with Express.js 4.x
- **Database:** Supabase (PostgreSQL) via @supabase/supabase-js
- **Email API:** Resend (free tier, 100 emails/day, default shared domain)
- **Hosting:** Railway (persistent server, no cold start)

## Repository Structure
This is a monorepo. The backend lives in `/server`. Do not modify files in `/client`.

```
server/
├── src/
│   ├── routes/
│   │   ├── send.js          # POST /api/send
│   │   ├── inbox.js         # GET /api/inbox, PATCH /api/inbox/:id, POST /api/simulate-inbound
│   │   ├── usage.js         # GET /api/usage, GET /api/usage/history
│   │   ├── budget.js        # GET /api/budget, POST /api/budget
│   │   ├── activity.js      # GET /api/activity
│   │   └── rates.js         # GET /api/rates
│   ├── services/
│   │   ├── channelRouter.js  # Dispatches sends to the correct channel service
│   │   ├── billingEngine.js  # Cost calculation, usage event logging, budget threshold checks
│   │   ├── emailService.js   # Resend SDK wrapper
│   │   └── slackService.js   # Stretch goal — Slack Incoming Webhook
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handling
│   │   └── budgetGuard.js    # Pre-send budget check middleware
│   ├── config/
│   │   ├── supabase.js       # Supabase client initialization
│   │   ├── rates.js          # Rate card constants
│   │   └── seed.js           # Auto-seed demo data on startup
│   └── index.js              # Express app entry point
├── .env
└── package.json
```

## Environment Variables
```
RESEND_API_KEY=re_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...   # Stretch goal
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Rate Card Constants (config/rates.js)
```javascript
module.exports = {
  RATE_EMAIL_SEND: 0.001,
  RATE_SLACK_SEND: 0.005,
  RATE_INBOX_PULL: 0.0002,
  RATE_STORAGE_DAY: 0.0001,
};
```

## Database Schema
Three tables in Supabase PostgreSQL. Supabase Realtime is enabled on `usage_events`.

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| direction | TEXT | 'inbound' or 'outbound' |
| channel | TEXT | 'email' or 'slack' |
| recipient | TEXT | Destination address |
| sender | TEXT | Nullable, for inbound only |
| subject | TEXT | Nullable, email only |
| body | TEXT | Message content |
| status | TEXT | 'queued', 'sent', 'delivered', 'read', 'archived', 'failed' |
| cost | DECIMAL(10,6) | From rate card |
| created_at | TIMESTAMPTZ | now() |
| updated_at | TIMESTAMPTZ | now() |

### usage_events
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| event_type | TEXT | 'send', 'inbox_pull', 'status_check', 'send_failed' |
| channel | TEXT | 'email', 'slack', 'system' |
| cost | DECIMAL(10,6) | 0 for failures |
| message_id | UUID FK | Nullable, references messages(id) |
| description | TEXT | Human-readable for Activity Feed |
| created_at | TIMESTAMPTZ | now() |

### budgets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| limit_amount | DECIMAL(10,2) | Default 10.00 |
| period | TEXT | 'daily', 'weekly', 'monthly' |
| alert_at_75 | BOOLEAN | Default true |
| alert_at_90 | BOOLEAN | Default true |
| hard_stop_at_100 | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | now() |
| updated_at | TIMESTAMPTZ | now() |

## API Contract Summary

### POST /api/send
**Request:** `{ channel, recipient, subject?, body }`
**Success (201):**
```json
{
  "message": { "id", "status": "queued", "channel", "cost", "created_at" },
  "billing": { "totalSpend", "budgetPercent", "alerts": [{ "type", "threshold" }] }
}
```
**Budget blocked (402):** `{ error: "BUDGET_EXCEEDED", message, currentSpend, budgetLimit }`
**Failure (500):** `{ error: "SEND_FAILED", message, charged: false }`

### GET /api/inbox
**Query params:** status (unread|read|archived|all), channel, limit (20), offset (0)
**Response:** `{ messages: [...], total, pullCost: 0.0002, counts: { unread, read, archived } }`
Each call logs an inbox_pull usage event.

### PATCH /api/inbox/:id
**Request:** `{ status: "read"|"archived" }`
**Response:** `{ message: { id, status, updated_at } }`

### GET /api/usage
**Response:** `{ currentSpend, messagesSent, inboxPulls, byChannel: { email: {count, cost}, slack: {...}, inbox_pull: {...} }, period: { start, end } }`

### GET /api/usage/history
**Response:** `{ history: [{ date, spend, sends, pulls }, ...] }`

### GET /api/budget
**Response:** `{ budget: { id, limit_amount, period, alert_at_75, alert_at_90, hard_stop_at_100 }, consumed: { amount, percent } }`

### POST /api/budget
**Request:** `{ limit_amount, alert_at_75, alert_at_90, hard_stop_at_100 }`
**Response:** Updated budget object.

### GET /api/activity
**Query params:** limit (50)
**Response:** `{ events: [{ id, event_type, channel, cost, description, created_at }], sessionTotal }`

### GET /api/rates
**Response:** `{ rates: { email_send: 0.001, slack_send: 0.005, inbox_pull: 0.0002, storage_per_day: 0.0001 } }`

### POST /api/simulate-inbound
**Request (all optional):** `{ sender, body }`
**Response (201):** Created message object.

## Core Service Logic

### Channel Router
Switch on channel → delegate to emailService or slackService → return normalized `{ externalId, status }`.

### Billing Engine — processSend(messageId, channel, recipient)
1. Look up cost from rate card
2. Insert usage_event row (event_type: 'send', channel, cost, message_id, description)
3. Query current period spend: `SELECT SUM(cost) FROM usage_events WHERE created_at >= period_start`
4. Compare against budget thresholds
5. Return `{ cost, totalSpend, budgetPercent, alerts }`

### Billing Engine — processInboxPull()
1. Insert usage_event (event_type: 'inbox_pull', channel: 'system', cost: RATE_INBOX_PULL)
2. Return `{ pullCost }`

### Budget Guard Middleware
Applied to POST /api/send only. Before send executes:
1. Get current spend + projected cost
2. If hard_stop_at_100 AND spend would exceed limit → reject with 402
3. Otherwise, attach warning flags to req object and continue

### Status Progression
After successful send, fire setTimeout chain:
- 0ms: message status = 'queued' (from initial insert)
- 1000ms: UPDATE status = 'sent'
- 3500ms: UPDATE status = 'delivered'
- 'read' only set via PATCH /api/inbox/:id

### Error Handling
All routes use async/await. Centralized error handler catches unhandled errors.
- BUDGET_EXCEEDED → 402
- SEND_FAILED → 500, log usage_event with event_type: 'send_failed', cost: 0
- VALIDATION_ERROR → 400
- NOT_FOUND → 404
- Everything else → 500

### Seed Service
On startup, check: `SELECT COUNT(*) FROM messages`. If < 5:
- Insert 15 messages (mix inbound/outbound, various statuses, 10-14 day spread)
- Insert corresponding usage_events
- Total spend should be ~$6.50 (65% of $10 budget)
- 3-5 live sends during demo will push past 75% alert threshold
- Expose resetSeed() via POST /api/dev/reset-seed

## Conventions
- All routes are in separate files under src/routes/, mounted in index.js
- All business logic lives in src/services/, never directly in route handlers
- Use Supabase service key (SUPABASE_SERVICE_KEY) for server-side operations — not the anon key
- Return consistent JSON response shapes matching the API contract above
- Always include `description` field when inserting usage_events — it powers the Activity Feed
- CORS: allow CLIENT_URL and http://localhost:5173
- Port: process.env.PORT || 3001

## Commit Message Convention
feat: / fix: / chore: / style: / docs: prefix on all commits.

## What NOT to Do
- Do not install or configure any frontend dependencies
- Do not modify anything in /client
- Do not hardcode Supabase or Resend credentials — always use process.env
- Do not use Supabase anon key for server-side operations — use the service key
- Do not build webhook/push infrastructure — Pull Inbox only
- Do not build authentication — single-user demo app
