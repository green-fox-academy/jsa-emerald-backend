const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  getReqToken,
  verifyToken,
  passwordHash,
  signature60min,
  signature30day,
  getTokenSet,
} = require('./Auth');

describe('Auth Utility File', () => {
  it('getReqToken Null', () => {
    const token = '';
    const testObj = { headers: { } };
    const res = getReqToken(testObj);
    expect(res).toEqual(token);
  });

  it('getReqToken Empty', () => {
    const token = '';
    const testObj = { headers: { authorization: `Bearer ${token}` } };
    const res = getReqToken(testObj);
    expect(res).toEqual(token);
  });

  it('getReqToken', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const testObj = { headers: { authorization: `Bearer ${token}` } };
    const res = getReqToken(testObj);
    expect(res).toEqual(token);
  });

  it('passwordHash Empty', () => {
    const password = '';
    const res = passwordHash(password);
    expect(bcrypt.compareSync(password, res)).toEqual(true);
  });

  it('passwordHash', () => {
    const password = '123456678';
    const res = passwordHash(password);
    expect(bcrypt.compareSync(password, res)).toEqual(true);
  });

  it('signature60min', () => {
    const obj = { name: 'mike', email: 'mike@gmail.com' };
    const secret = 'SECRET';
    const res = signature60min(obj, secret);
    const resObj = jwt.verify(res, secret);
    expect(resObj.name).toEqual(obj.name);
    expect(resObj.email).toEqual(obj.email);
  });

  it('signature30day', () => {
    const obj = { name: 'mike', email: 'mike@gmail.com' };
    const secret = 'SECRET';
    const res = signature30day(obj, secret);
    const resObj = jwt.verify(res, secret);
    expect(resObj.name).toEqual(obj.name);
    expect(resObj.email).toEqual(obj.email);
  });

  it('getTokenSet', () => {
    const obj = { name: 'mike', email: 'mike@gmail.com' };
    const secret = 'SECRET';
    const res = getTokenSet(obj, secret);
    const resObj60min = jwt.verify(res.accessToken, secret);
    const resObj30day = jwt.verify(res.refreshToken, secret);
    expect(resObj60min.name).toEqual(obj.name);
    expect(resObj60min.email).toEqual(obj.email);
    expect(resObj30day.name).toEqual(obj.name);
    expect(resObj30day.email).toEqual(obj.email);
  });

  const mockResponse = () => {
    const res = {};
    res.sendStatus = jest.fn((val) => { res.status = val; });
    return res;
  };

  it('verifyToken Empty', async () => {
    const token = '';
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockResponse();
    await verifyToken(req, res, () => {});
    expect(res.status).toEqual(401);
  });
});
