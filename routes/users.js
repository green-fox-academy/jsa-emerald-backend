const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const debug = require('debug')('Emerald:Users');
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
      debug(err);
      return res.sendStatus(500);
    }

    if (!prefix) {
      return res.json({ userList });
    }

    const filteredUserList = userList.filter((user) => user.username.includes(prefix));
    return res.json({ userList: filteredUserList });
  });
});

router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const Users = mongoose.model('Users', usersBasic);
  Users.find({ username, email }, (err, found) => {
    if (err) {
      debug(err);
      return res.sendStatus(500);
    }

    if (found.length > 0) {
      return res.status(400).json({ error: 'User exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(password, salt);
    const newUser = new Users({ username, email, hashedPass });
    const token = jwt.sign({ username, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    newUser.save((error) => {
      if (error) {
        debug(error);
        return res.sendStatus(500);
      }
      return res.json({ authData: token });
    });

    return null;
  });
});

module.exports = router;
