require('dotenv').config();

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH'],
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const routeFiles = [
  './routes/send',
  './routes/inbox',
  './routes/usage',
  './routes/budget',
  './routes/activity',
  './routes/rates',
];

for (const routePath of routeFiles) {
  try {
    app.use('/api', require(routePath));
  } catch (err) {
    console.warn(`[Warning] Could not load route ${routePath}:`, err.message);
  }
}

// Dev reset endpoint
try {
  const { resetSeed } = require('./config/seed');
  app.post('/api/dev/reset-seed', async (req, res, next) => {
    try {
      await resetSeed();
      res.json({ message: 'Seed data reset successfully' });
    } catch (err) {
      next(err);
    }
  });
} catch (err) {
  console.warn('[Warning] Seed module not available:', err.message);
}

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`[OpenCourier] Server running on port ${PORT}`);

  try {
    const { checkAndSeed } = require('./config/seed');
    await checkAndSeed();
    console.log('[OpenCourier] Seed check complete');
  } catch (err) {
    console.warn('[Warning] Seed check failed:', err.message);
  }
});

module.exports = app;
