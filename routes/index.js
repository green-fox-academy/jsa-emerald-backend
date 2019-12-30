const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('Emerald:Index');
const { mongoose } = require('../mongoDB');
const { verifyToken } = require('../Utils/Auth');
const { families } = require('../Models/Families');
const nodeMailer = require('../Utils/Email');
const { usersBasic } = require('../Models/Users');

const router = express.Router();

router.get('/heartbeat', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.sendStatus(200);
  }
  return res.sendStatus(500);
});

router.post('/backup', (req, res) => {
  const transactions = req.body;
  if (transactions.length) {
    return res.sendStatus(200);
  }
  return res.sendStatus(404);
});

router.post('/family', verifyToken, async (req, res) => {
  const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
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

module.exports = router;
