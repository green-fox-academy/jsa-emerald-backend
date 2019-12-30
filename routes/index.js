const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('Emerald:Users');
const { mongoose } = require('../mongoDB');
<<<<<<< HEAD
const { verifyToken } = require('../Utils/Auth');
const { families } = require('../Models/Families');
const nodeMailer = require('../Utils/Email');
const { usersBasic } = require('../Models/Users');
const { transaction } = require('../Models/Transaction');
=======
const { usersFull } = require('../Models/Users');
const {
  verifyToken,
} = require('../Utils/Auth');
>>>>>>> JSAEM2-10 fixed: fix bcrypt bug

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

router.post('/backup', verifyToken, (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const { username } = decoded;
  const { transactions } = req.body;
  if (!decoded) {
    return res.sendStatus(401);
  }
  if (!transactions) {
    return res.sendStatus(400);
  }
  const Users = mongoose.model('Users', usersFull);
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
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  const { username } = decoded;
  if (!decoded) {
    return res.sendStatus(401);
  }
  const Users = mongoose.model('Users', usersFull);
  Users.findOne({ username }, (err, found) => {
    if (err) {
      debug(err);
      return res.sendStatus(500);
    }
    const { transactions } = found;
    return res.json(transactions[0]);
  });
  return null;
});

router.post('/family', verifyToken, async (req, res) => {
  let decoded;
  try {
    decoded = jwt.verify(req.token, process.env.JWT_SECRET);
  } catch (err) {
    return res.sendStatus(401);
  }

  if (!decoded) {
    return res.sendStatus(401);
  }
  const { members } = req.body;
  if (!members) {
    return res.sendStatus(400);
  }

  const memberList = members.split(',').map((id) => mongoose.Types.ObjectId(id));
  if (memberList.length === 0) {
    return res.sendStatus(400);
  }

  const Users = mongoose.model('Users', usersBasic);
  const filteredMembers = await Users.find({ _id: { $in: memberList } });

  if (filteredMembers.length === 0) {
    return res.sendStatus(400);
  }

  const Families = mongoose.model('families', families);
  const newFamily = new Families({
    creator: decoded.id,
    members: filteredMembers.map((user) => user.id),
  });

  newFamily.save((err) => {
    if (err) {
      debug(err);
      return res.sendStatus(500);
    }

    nodeMailer.sendMail({
      to: filteredMembers.map((user) => user.email),
      subject: 'New Family Group From Money Honey',
      body: '',
    }, (error, info) => {
      if (error) {
        debug(error);
        return res.sendStatus(500);
      }
      debug('Message %s sent: %s', info.messageId, info.response);
      return res.sendStatus(200);
    });
    return null;
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

  if (!decoded) {
    return res.sendStatus(401);
  }

  const {
    amount, labelName, date, type,
  } = req.body;

  if (!amount || !labelName || !date || !type) {
    return res.sendStatus(400);
  }

  const Families = mongoose.model('families', families);
  const family = await Families.findOne({
    $or: [{ members: decoded.id },
      { creator: decoded.id }],
  });
  if (!family.transactions) {
    family.transactions = [];
  }

  const Transaction = mongoose.model('transaction', transaction);
  family.transactions.push(new Transaction({
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

  if (!decoded) {
    return res.sendStatus(401);
  }

  const Families = mongoose.model('families', families);
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
