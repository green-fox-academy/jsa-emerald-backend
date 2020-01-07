const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../Models/Users');
const {
  verifyToken, passwordHash, getTokenSet,
} = require('../Utils/Auth');
const mailer = require('../Utils/Mailer');

const router = express.Router();

router.get('/users', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET);
  const { prefix } = req.query;

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

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json(
      {
        code: 400,
        message: 'Please provide valid username, email, and passwords',
      },
    );
  }

  Users.find({ username, email }, (err, found) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: 'Unexpected server error occurred, please try it later',
      });
    }

    if (found.length > 0) {
      return res.status(409).json({
        code: 409,
        message: 'User exists already',
      });
    }

    const hashedPass = passwordHash(password);
    const newUser = new Users({ username, email, hashedPass });

    newUser.save((error, saved) => {
      if (error) {
        return res.status(500).json({
          code: 500,
          message: 'Unexpected server error occurred, please try it later',
        });
      }

      mailer.sendMail({
        to: email,
        subject: 'Welcome to Money Honey Application',
        body: '',
      }, () => {});

      return res.json(getTokenSet({ username, email, id: saved.id }, process.env.JWT_SECRET));
    });

    return null;
  });

  return null;
});

router.post('/sessions', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 400, message: 'Please provide valid email and password' });
  }

  Users.find({ email }, (err, found) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Unexpected server error occurred, please try it later' });
    }

    if (found.length === 0) {
      return res.status(404).json({ code: 404, message: 'User Not Found' });
    }

    if (!bcrypt.compareSync(password, found[0].hashedPass)) {
      return res.status(401).json({ code: 401, message: 'Please provide valid email and password' });
    }

    return res.json(getTokenSet({
      username: found[0].username,
      email: found[0].email,
      id: found[0].id,
    }, process.env.JWT_SECRET));
  });

  return null;
});

module.exports = router;
