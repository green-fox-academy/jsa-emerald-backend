const express = require('express');
const { redisClient } = require('../redisDB');

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (redisClient.connected) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

router.post('/backup', (req, res) => {
  const transactions = req.body;
  if (transactions.length) {
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
});

router.get('*', (req, res) => {
  res.sendStatus(404);
});

module.exports = router;
