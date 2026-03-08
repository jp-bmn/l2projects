const express = require('express')
const cors = require('cors')
const { initDb } = require('./db/database')

const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }))
app.use(express.json())

// ── Routes ──
app.use('/api/buildings', require('./routes/buildings'))
app.use('/api/energy', require('./routes/energy'))
app.use('/api/solar', require('./routes/solar'))
app.use('/api/alerts', require('./routes/alerts'))
app.use('/api/sensors', require('./routes/sensors'))

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ── 404 catch-all ──
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` })
})

// ── Error handler ──
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

;(async () => {
  await initDb()
  app.listen(PORT, () => {
    console.log(`🌿 GreenEyes NYC API running on http://localhost:${PORT}`)
    console.log(`   Routes: /api/buildings  /api/energy  /api/solar  /api/alerts  /api/sensors`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
  })
})()
