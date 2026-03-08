const express = require('express')
const router = express.Router()
const { getDB, saveDb } = require('../db/database')

// GET /api/sensors/:buildingId
router.get('/:buildingId', (req, res) => {
  const db = getDB()
  const sensors = db.prepare(
    'SELECT * FROM sensors WHERE building_id = ? ORDER BY sensor_type'
  ).all(req.params.buildingId)
  res.json(sensors)
})

// GET /api/sensors/:buildingId/status
router.get('/:buildingId/status', (req, res) => {
  const db = getDB()
  const latest = db.prepare(
    'SELECT last_heartbeat FROM sensors WHERE building_id = ? ORDER BY id DESC LIMIT 1'
  ).get(req.params.buildingId)
  res.json({
    online: true,
    last_heartbeat: latest?.last_heartbeat || new Date().toISOString(),
  })
})

// PATCH /api/sensors/:id/heartbeat — called by sensor devices
router.patch('/:id/heartbeat', (req, res) => {
  const db = getDB()
  db.prepare('UPDATE sensors SET last_heartbeat = ? WHERE id = ?').run(new Date().toISOString(), req.params.id)
  saveDb()
  res.json({ success: true })
})

module.exports = router
