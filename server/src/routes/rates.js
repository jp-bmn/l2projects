const express = require('express');
const router = express.Router();

// GET /api/rates
router.get('/rates', (req, res) => {
  res.json({
    rates: {
      email_send: 0.001,
      slack_send: 0.005,
      inbox_pull: 0.0002,
      storage_per_day: 0.0001,
    },
  });
});

module.exports = router;
