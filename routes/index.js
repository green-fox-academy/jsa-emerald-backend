const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyToken } = require('../Utils/Auth');
const Families = require('../Models/Families');
const Users = require('../Models/Users');
const Transactions = require('../Models/Transaction');
const mailer = require('../Utils/Mailer');

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

router.post('/backup', verifyToken, (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }
  const { username } = decoded;
  const { transactions } = req.body;

  if (!transactions) {
    return res.sendStatus(400);
  }

  Users.updateOne(
    { username },
    {
      $set: {
        transactions,
      },
    },
    (err) => {
      if (err) {
        return res.sendStatus(500);
      }
      return res.sendStatus(200);
    },
  );
  return null;
});

router.get('/restore', verifyToken, (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }
  const { username } = decoded;

  Users.findOne({ username }, (err, found) => {
    if (err) {
      return res.sendStatus(500);
    }
    const { transactions } = found;
    return res.json(transactions);
  });
  return null;
});

router.post('/family', verifyToken, async (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);

  const { members } = req.body;
  if (!members) {
    return res.status(400).json({
      code: 400,
      message: 'Please provide a valid list of members',
    });
  }

  const memberList = members.map((id) => {
    try {
      return mongoose.Types.ObjectId(id);
    } catch (err) {
      return null;
    }
  }).filter((i) => i);

  if (memberList.length === 0) {
    return res.status(400).json({ code: 400, message: 'Member list cannot be empty' });
  }

  const filteredMembers = await Users.find({ _id: { $in: memberList } });

  if (filteredMembers.length === 0) {
    return res.status(400).json({ code: 400, message: 'Member list cannot be empty' });
  }

  const newFamily = new Families({
    creator: decoded.id,
    members: filteredMembers.map((user) => user.id),
  });

  newFamily.save((err) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: 'Unexpected error occurred, please try it later',
      });
    }

    mailer.sendMail({
      to: filteredMembers.map((user) => user.email),
      subject: 'New Family Group From Money Honey',
      body: '',
    }, () => {});

    return res.sendStatus(200);
  });
  return null;
});

router.post('/family-transactions', verifyToken, async (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }

  const {
    amount, labelName, date, type,
  } = req.body;

  if (!amount || !labelName || !date || !type) {
    return res.sendStatus(400);
  }

  const family = await Families.findOne({
    $or: [{ members: decoded.id },
      { creator: decoded.id }],
  });

  family.transactions.push(new Transactions({
    creator: decoded.id, amount, labelName, date, type,
  }));

  family.save((err) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.sendStatus(200);
  });

  return null;
});

router.get('/family-transactions', verifyToken, async (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }

  const family = await Families.findOne({
    $or: [{ members: decoded.id },
      { creator: decoded.id }],
  });

  if (!family) {
    return res.json([]);
  }

  return res.json(family.transactions);
});

module.exports = router;
