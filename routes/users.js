const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../Model/User');
const {
  verifyToken, passwordHash, getTokenSet,
} = require('../Utils/Auth');
const mailer = require('../Utils/Mailer');

const router = express.Router();

router.get('/users', verifyToken, (req, res) => {
  const { contain } = req.query;

  User.find({ _id: { $ne: req.authUser.id } }, (err, userList) => {
    if (err) {
      return res.sendStatus(500);
    }

    const returnList = userList.map((item) => ({
      id: item.id,
      username: item.username,
      email: item.email,
    }));

    if (!contain) {
      return res.json(returnList);
    }

    const filteredUserList = returnList
      .filter((user) => user.username.includes(contain));
    return res.json(filteredUserList);
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

  User.find({ email }, (err, found) => {
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
    const newUser = new User({ username, email, hashedPass });

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

  User.find({ email }, (err, found) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Unexpected server error occurred, please try it later' });
    }

    if (found.length === 0) {
      return res.status(401).json({ code: 401, message: 'Please provide valid email and password' });
    }

    if (!bcrypt.compareSync(password, found[0].hashedPass)) {
      return res.status(401).json({ code: 401, message: 'Please provide valid email and password' });
    }

    return res.json({
      ...getTokenSet({
        username: found[0].username,
        email: found[0].email,
        id: found[0].id,
      }, process.env.JWT_SECRET),
      username: found[0].username,
    });
  });

  return null;
});

module.exports = router;
