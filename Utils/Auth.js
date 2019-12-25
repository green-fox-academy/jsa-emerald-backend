const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const getReqToken = (req) => {
  let token = '';
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    [, token] = req.headers.authorization.split(' ');
  }
  return token;
};

const verifyToken = (req, res, next) => {
  const token = getReqToken(req);
  if (token === '') {
    res.sendStatus(401);
  }
  req.token = token;
  next();
};

const passwordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const signature60min = (obj) => jwt.sign(obj, process.env.JWT_SECRET, { expiresIn: '1h' });

const signature30day = (obj) => jwt.sign(obj, process.env.JWT_SECRET, { expiresIn: '30d' });

const getTokenSet = (obj) => ({
  accessToken: signature60min(obj),
  accessTokenExpiresAt: moment().add(1, 'hours').format(),
  refreshToken: signature30day(obj),
  refreshTokenExpiresAt: moment().add(30, 'days').format(),
});

module.exports = {
  verifyToken,
  passwordHash,
  signature60min,
  signature30day,
  getTokenSet,
};
