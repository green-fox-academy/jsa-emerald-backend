const express = require('express');
const mongoose = require('mongoose');
const { verifyToken } = require('../Utils/Auth');

const User = require('../Model/User');

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

router.post('/backup', verifyToken, (req, res) => {
  const { username } = req.authUser;
  const { transactions } = req.body;
  if (!transactions) {
    return res.status(400).json({ code: 400, message: 'No transactions found' });
  }

  User.updateOne(
    { username },
    {
      $set: {
        transactions,
      },
    },
    (err) => {
      if (err) {
        return res.status(500).json({ code: 500, message: 'Unexpected error occurred, please try again later' });
      }
      return res.sendStatus(200);
    },
  );
  return null;
});

router.get('/backup', verifyToken, (req, res) => {
  const { username } = req.authUser;

  User.findOne({ username }, (err, found) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Unexpected error occurred, please try again later' });
    }
    const { transactions } = found;
    return res.json(transactions);
  });
  return null;
});

module.exports = router;
