const express = require('express');
const jwt = require('jsonwebtoken');
const { redisClient } = require('../redisDB');
const { verifyToken } = require('../Utils/Auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const { prefix } = req.query;

  if (!decoded) {
    res.sendStatus(401);
  }

  redisClient.keys('*', (err, userList) => {
    if (err) {
      res.sendStatus(500);
    }
    if (!prefix) {
      res.json({ userList });
    }

    const filteredUserList = userList.filter((key) => key.includes(prefix));
    res.json({ userList: filteredUserList });
  });
});

module.exports = router;
