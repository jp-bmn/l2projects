# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
npm install
npm run seed      # creates/resets greeneyes.sqlite with sample data
npm run dev       # starts Express API on http://localhost:4000
npm start         # production start (no auto-reload)
```

Verify backend: `GET http://localhost:4000/api/health` → `{"status":"ok"}`

### Frontend
```bash
cd frontend
npm install
npm run dev       # starts Vite dev server on http://localhost:3000
npm run build     # production build
npm run preview   # preview production build
```

There is no test suite currently.

## Architecture

This is a 6-page horizontal-scroll marketing/product site for a NYC energy monitoring SaaS (Green Eyes). The frontend slides between pages using a `translateX` CSS transform — all 6 pages render simultaneously in a `600vw` flex container; `PageNavContext` tracks the active page index.

### Frontend (`frontend/src/`)
- **`App.jsx`** — root layout: renders all 6 pages side-by-side, wraps in `PageNavProvider`
- **`context/PageNavContext.jsx`** — global page index state + navigation logic
- **`components/pages/`** — one component per page (Page1Intro through Page6Outro)
- **`components/dashboard/`** — dashboard widgets (KPICard, CountdownTimer, charts, etc.) used on Page 3
- **`components/ui/`** — reusable display primitives: `IPhoneMockup`, `IPadMockup`, `WireAnimation`, `BlueprintBuilding`, `PageNav`
- **`api/`** — one file per resource (`buildings.js`, `energy.js`, `solar.js`, `alerts.js`, `sensors.js`). Every API file uses a **safeFetch pattern**: try real API call, catch and return mock data. This means the frontend works without the backend running.

### Backend (`backend/`)
- Express server with routes in `backend/routes/` (one file per resource)
- SQLite via `sql.js` (in-memory + file persistence). Schema defined in `backend/db/database.js` `initSchema()`. DB is saved to `backend/db/greeneyes.sqlite`.
- `backend/db/seed.js` populates all tables with sample buildings (30 Hudson Yards, One WTC, 432 Park Ave)

### Page 3 Dashboard Data Flow
The live dashboard on Page 3 fetches from the backend and maps data as:
- `buildings` → building selector dropdown
- `ll97_limits` + `compliance_snapshots` → FineRiskMeter, compliance bars, CountdownTimer
- `energy_readings` + `floors` → EnergyChart (Recharts BarChart), FloorHeatmap
- `solar_readings` → SolarWidget (AC/E/H scores)
- `alerts` → AlertsPanel + header bell badge
- `sensors` → SystemsStatus card

## Code Style
- Plain JSX, no TypeScript
- Tailwind CSS utility classes for all styling; inline `style` only for dynamic/computed values
- `const` for all declarations, no semicolons, 2-space indent, single quotes
- Functional React components with hooks only (`useState` + `useEffect` for data fetching)
- Recharts for all charts

## Design System (Tailwind custom colors)
- `grass` / `grass-dark` / `grass-light` — primary greens (`#22c55e`, `#16a34a`, `#4ade80`)
- `blueprint-navy` / `blueprint-line` — Page 5 blueprint theme (`#0f2942`, `#4a9fd4`)
- Dashboard bg: dark navy gradient (`#020917` → `#0a0f1e`)

## Adding New Features
1. Add DB table/column to `backend/db/database.js` `initSchema()`
2. Add seed data to `backend/db/seed.js`
3. Add route to `backend/routes/` and register it in `backend/server.js`
4. Add API function to `frontend/src/api/` with mock fallback (safeFetch pattern)
5. Create component in the appropriate `components/` subfolder
6. Import and use in the relevant Page component

## Commit Style
Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
