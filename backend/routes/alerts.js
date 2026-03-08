const express = require('express')
const router = express.Router()
const { getDB, saveDb } = require('../db/database')

// GET /api/alerts/:buildingId
router.get('/:buildingId', (req, res) => {
  const db = getDB()
  const alerts = db.prepare(
    'SELECT * FROM alerts WHERE building_id = ? AND resolved_at IS NULL ORDER BY created_at DESC'
  ).all(req.params.buildingId)
  res.json(alerts)
})

// GET /api/alerts/:buildingId/count
router.get('/:buildingId/count', (req, res) => {
  const db = getDB()
  const row = db.prepare(
    'SELECT COUNT(*) AS count FROM alerts WHERE building_id = ? AND resolved_at IS NULL'
  ).get(req.params.buildingId)
  res.json({ count: row.count })
})

// PATCH /api/alerts/:id/resolve
router.patch('/:id/resolve', (req, res) => {
  const db = getDB()
  db.prepare('UPDATE alerts SET resolved_at = ? WHERE id = ?').run(new Date().toISOString(), req.params.id)
  saveDb()
  res.json({ success: true })
})

module.exports = router
