# Quick Start — GreenEyes NYC

Get the full stack running in under 5 minutes.

---

## Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- Git (check: `git --version`)

---

## Step 1 — Backend

```bash
cd backend
npm install
npm run seed     # creates greeneyes.sqlite + loads sample data
npm run dev      # starts API on http://localhost:4000
```

Verify: Open [http://localhost:4000/api/health](http://localhost:4000/api/health) — should return `{"status":"ok"}`.

---

## Step 2 — Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev      # starts Vite on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## What You'll See

| Page | URL anchor | Description |
|------|-----------|-------------|
| Page 1 | `#page1` | Green intro with animated wires |
| Page 2 | `#page2` | NYC skyline + feature circles |
| Page 3 | `#page3` | Live dashboard (calls backend API) |
| Page 4 | `#page4` | iPad + 4 iPhone 17 mockups |
| Page 5 | `#page5` | Blueprint building + feature buttons |
| Page 6 | `#page6` | Green outro with right-aligned tagline |

---

## Notes

- **No backend? No problem.** The frontend includes mock data fallbacks — the dashboard works even without the backend running.
- **Switching buildings**: Use the dropdown in the dashboard header to switch between 30 Hudson Yards, One WTC, and 432 Park Ave.
- **Seed data**: Run `npm run seed` from `backend/` any time to reset to sample data.
