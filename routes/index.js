const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('Emerald:Index');
// const nodeMailer = require('nodemailer');
const mongoose = require('mongoose');
const { verifyToken } = require('../Utils/Auth');
const Families = require('../Models/Families');
const Users = require('../Models/Users');
const Transactions = require('../Models/Transaction');

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
  const transactions = req.body;

  if (!decoded) {
    return res.sendStatus(401);
  }
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
        debug(err);
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
  if (!decoded) {
    return res.sendStatus(401);
  }

  Users.findOne({ username }, (err, found) => {
    if (err) {
      debug(err);
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
    return res.sendStatus(400);
  }

  const memberList = members.split(',').map((id) => mongoose.Types.ObjectId(id));
  if (memberList.length === 0) {
    return res.sendStatus(400);
  }

  const filteredMembers = await Users.find({ _id: { $in: memberList } });

  if (filteredMembers.length === 0) {
    return res.sendStatus(400);
  }

  const newFamily = new Families({
    creator: decoded.id,
    members: filteredMembers.map((user) => user.id),
  });

  newFamily.save((err) => {
    if (err) {
      debug(err);
      return res.sendStatus(500);
    }

    // const mailer = nodeMailer.createTransport({
    //   host: 'smtp.gmail.com',
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // mailer.sendMail({
    //   to: filteredMembers.map((user) => user.email),
    //   subject: 'New Family Group From Money Honey',
    //   body: '',
    // }, (error, info) => {
    //   if (error) {
    //     debug(error);
    //     return res.sendStatus(500);
    //   }
    //   debug('Message %s sent: %s', info.messageId, info.response);
    //   return res.sendStatus(200);
    // });
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
  if (!family.transactions) {
    family.transactions = [];
  }

  family.transactions.push(new Transactions({
    creator: decoded.id, amount, labelName, date, type,
  }));
  family.save((err) => {
    if (err) {
      debug(err);
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

  if (!family.transactions) {
    family.transactions = [];
  }

  return res.json(family.transactions);
});

module.exports = router;
