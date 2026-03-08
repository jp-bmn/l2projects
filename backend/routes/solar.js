const express = require('express')
const router = express.Router()
const { getDB } = require('../db/database')

// GET /api/solar/:buildingId
router.get('/:buildingId', (req, res) => {
  const db = getDB()
  const reading = db.prepare(
    'SELECT * FROM solar_readings WHERE building_id = ? ORDER BY reading_date DESC LIMIT 1'
  ).get(req.params.buildingId)
  if (!reading) return res.json({})

  res.json({
    ...reading,
    change_pct: 3,
    direction: 'down',
  })
})

// GET /api/solar/:buildingId/performance
router.get('/:buildingId/performance', (req, res) => {
  const db = getDB()
  const reading = db.prepare(
    'SELECT * FROM solar_readings WHERE building_id = ? ORDER BY reading_date DESC LIMIT 1'
  ).get(req.params.buildingId)
  res.json(reading || {})
})

module.exports = router
