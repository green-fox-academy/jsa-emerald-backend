const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('Emerald:Users');
const bcrypt = require('bcrypt');
const { mongoose } = require('../mongoDB');
const { usersBasic } = require('../Models/Users');

const {
  verifyToken, passwordHash, getTokenSet,
} = require('../Utils/Auth');

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
      return res.status(401).json({ error: 'User exists' });
    }

    const hashedPass = passwordHash(password);
    const newUser = new Users({ username, email, hashedPass });

    newUser.save((error) => {
      if (error) {
        debug(error);
        return res.sendStatus(500);
      }
      return res.json(getTokenSet({ username, email }));
    });

    return null;
  });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const Users = mongoose.model('Users', usersBasic);
  Users.find({ email }, (err, found) => {
    if (err) {
      debug(err);
      return res.sendStatus(500);
    }

    if (found.length === 0) {
      return res.status(401).json({ error: 'No User Found' });
    }

    if (!bcrypt.compareSync(password, found[0].hashedPass)) {
      return res.status(401).json({ error: 'Incorrect Password' });
    }

    return res.json(getTokenSet({ username: found[0].username, email: found[0].email }));
  });
});

module.exports = router;
