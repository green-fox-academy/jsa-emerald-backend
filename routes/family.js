const express = require('express');
const Transaction = require('../Model/Transaction');
const mailer = require('../Utils/Mailer');
const Family = require('../Model/Family');
const { verifyToken } = require('../Utils/Auth');
const User = require('../Model/User');

const router = express.Router();

router.post('/family', verifyToken, async (req, res) => {
  const { members } = req.body;
  if (!members) {
    return res.status(400).json({
      code: 400,
      message: 'Please provide a valid list of members',
    });
  }

  if (members.length === 0) {
    return res.status(400).json({ code: 400, message: 'The member list cannot be empty' });
  }

  const filteredMembers = await User.find({ username: { $in: members } });

  if (filteredMembers.length === 0) {
    return res.status(400).json({
      code: 400,
      message: 'The member list does not contain any valid user',
    });
  }

  const family = await Family.findOne({
    $or: [{ members: req.authUser.username },
      { creator: req.authUser.username }],
  });

  if (family) {
    family.members = filteredMembers.map((user) => user.username);
    family.save();
    return res.sendStatus(200);
  }

  const newFamily = new Family({
    creator: req.authUser.username,
    members: filteredMembers.map((user) => user.username),
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
    }, () => { });

    return res.sendStatus(200);
  });
  return null;
});

router.post('/family-transactions', verifyToken, async (req, res) => {
  const {
    amount, labelName, date, type,
  } = req.body;

  if (!amount || !labelName || !date || !type) {
    return res.status(400).json({
      code: 400,
      message: 'Please provide valid transaction information: { amount, labelName, date, type }',
    });
  }

  const family = await Family.findOne({
    $or: [{ members: req.authUser.username },
      { creator: req.authUser.username }],
  });

  if (!family) {
    return res.status(400).json({
      code: 400,
      message: 'Please create/join a family first',
    });
  }

  family.transactions.push(new Transaction({
    creator: req.authUser.username, amount, labelName, date, type,
  }));

  family.save((err) => {
    if (err) {
      return res.status(500).json({
        code: 500,
        message: 'Unexpected error occurred, please try it later',
      });
    }
    return res.sendStatus(200);
  });

  return null;
});

router.get('/family-transactions', verifyToken, async (req, res) => {
  const family = await Family.findOne({
    $or: [{ members: req.authUser.username },
      { creator: req.authUser.username }],
  });

  if (!family) {
    return res.status(404).json({ code: 404, message: 'Family Not Found' });
  }

  return res.json({ code: 200, data: family.transactions });
});

router.get('/family-members', verifyToken, async (req, res) => {
  const family = await Family.findOne({
    $or: [{ members: req.authUser.username },
      { creator: req.authUser.username }],
  });

  if (!family) {
    return res.status(404).json({ code: 404, message: 'Family Not Found' });
  }

  return res.json({ code: 200, data: family.members.map((username) => ({ username, url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg' })) });
});

module.exports = router;
