const express = require('express');
const jwt = require('jsonwebtoken');
const { mongoose } = require('../mongoDB');
const { usersBasic } = require('../Models/Users');
const { verifyToken } = require('../Utils/Auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const { prefix } = req.query;

  if (!decoded) {
    res.sendStatus(401);
  }

  const Users = mongoose.model('Users', usersBasic);
  Users.find((err, userList) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (!prefix) {
      return res.json({ userList });
    }

    const filteredUserList = userList.filter((user) => user.username.includes(prefix));
    return res.json({ userList: filteredUserList });
  });
});

module.exports = router;
