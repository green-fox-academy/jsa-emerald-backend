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
    return res.status(401).json({ code: 401, message: 'Please provide valid authorized token' });
  }
  try {
    req.authUser = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: 'Please provide valid authorized token' });
  }
  try {
    req.authUser = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    return next();
  } catch (error) {
    return res.sendStatus(401);
  }
};

const passwordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const signature60min = (obj, secret) => jwt.sign(obj, secret, { expiresIn: '1h' });

const signature30day = (obj, secret) => jwt.sign(obj, secret, { expiresIn: '30d' });

const getTokenSet = (obj, secret) => ({
  accessToken: signature60min(obj, secret),
  accessTokenExpiresAt: moment().add(1, 'hours').format(),
  refreshToken: signature30day(obj, secret),
  refreshTokenExpiresAt: moment().add(30, 'days').format(),
});

module.exports = {
  getReqToken,
  verifyToken,
  passwordHash,
  signature60min,
  signature30day,
  getTokenSet,
};
