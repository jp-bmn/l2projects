const express = require('express')
const router = express.Router()
const { getDB } = require('../db/database')

// GET /api/buildings
router.get('/', (req, res) => {
  const db = getDB()
  const buildings = db.prepare('SELECT * FROM buildings ORDER BY name').all()
  res.json(buildings)
})

// GET /api/buildings/:id
router.get('/:id', (req, res) => {
  const db = getDB()
  const building = db.prepare('SELECT * FROM buildings WHERE id = ?').get(req.params.id)
  if (!building) return res.status(404).json({ error: 'Building not found' })
  res.json(building)
})

// GET /api/buildings/:id/ll97
router.get('/:id/ll97', (req, res) => {
  const db = getDB()
  const data = db.prepare('SELECT * FROM ll97_limits WHERE building_id = ? ORDER BY year DESC LIMIT 1').get(req.params.id)
  res.json(data || {})
})

// GET /api/buildings/:id/compliance
router.get('/:id/compliance', (req, res) => {
  const db = getDB()
  const data = db.prepare('SELECT * FROM compliance_snapshots WHERE building_id = ? ORDER BY snapshot_date DESC LIMIT 1').get(req.params.id)
  res.json(data || {})
})

module.exports = router
