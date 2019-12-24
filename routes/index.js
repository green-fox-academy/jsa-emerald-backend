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

router.post('/register', (req, res) => {
  if (req.body.email !== '' && req.body.password !== '') {
    res.json({
      accessToken: '0xa143981f3ec758296a1575146eab03ef047b7e40',
    });
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
