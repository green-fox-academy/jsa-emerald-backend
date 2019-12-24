const express = require('express');
const jwt = require('jsonwebtoken');
const { redisClient } = require('../redisDB');
const { verifyToken } = require('../Utils/Auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  if (!decoded) {
    res.sendStatus(401);
  }

  redisClient.keys('*', (err, userList) => {
    if (err) {
      res.sendStatus(500);
    }
    res.json({ userList });
  });
});

module.exports = router;
