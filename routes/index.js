const express = require('express');
const { redisClient } = require('../redisDB');

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (redisClient.connected) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

module.exports = router;
