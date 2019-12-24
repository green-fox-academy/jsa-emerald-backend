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

module.exports = { verifyToken };
