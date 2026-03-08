const express = require('express')
const router = express.Router()
const { getDB } = require('../db/database')

// GET /api/energy/:buildingId?days=7
router.get('/:buildingId', (req, res) => {
  const db = getDB()
  const days = parseInt(req.query.days) || 7
  const rows = db.prepare(
    'SELECT reading_date, kwh_actual, kwh_limit FROM energy_readings WHERE building_id = ? ORDER BY reading_date DESC LIMIT ?'
  ).all(req.params.buildingId, days)
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const out = rows.reverse().map(r => ({
    day: r.reading_date && r.reading_date.length === 10
      ? DAY_NAMES[new Date(r.reading_date + 'T12:00:00').getDay()]
      : r.reading_date,
    kwh_actual: r.kwh_actual,
    kwh_limit: r.kwh_limit,
  }))
  res.json(out)
})

// GET /api/energy/:buildingId/current
router.get('/:buildingId/current', (req, res) => {
  const db = getDB()
  const latest = db.prepare(
    'SELECT * FROM energy_readings WHERE building_id = ? ORDER BY id DESC LIMIT 1'
  ).get(req.params.buildingId)
  if (!latest) return res.json({ current_kw: 0, change_pct: 0, direction: 'up' })

  const pct = latest.previous_week_kw
    ? Math.round(((latest.peak_demand_kw - latest.previous_week_kw) / latest.previous_week_kw) * 100)
    : 0
  res.json({
    current_kw: latest.peak_demand_kw,
    change_pct: Math.abs(pct),
    direction: pct >= 0 ? 'up' : 'down',
  })
})

// GET /api/energy/:buildingId/floors
router.get('/:buildingId/floors', (req, res) => {
  const db = getDB()
  const floors = db.prepare(
    'SELECT floor_number AS floor, energy_status FROM floors WHERE building_id = ? ORDER BY floor_number'
  ).all(req.params.buildingId)
  res.json(floors)
})

module.exports = router
