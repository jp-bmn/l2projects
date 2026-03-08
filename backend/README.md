# GreenEyes NYC — Backend

API server (Express + SQLite) for the GreenEyes NYC app.

## Node version

**Use Node 18 or 20.** The `better-sqlite3` native addon does not build on Node 24 yet.

- If you use **nvm**: run `nvm use` in this folder (`.nvmrc` is set to 20), then `npm install`.
- Otherwise install Node 20 LTS and run `npm install` here.

## Install and run

```bash
cd backend
npm install
npm run seed   # load sample data (run once)
npm run dev    # or: node server.js
```

API runs at **http://localhost:4000**. Frontend proxies `/api` to this port.
