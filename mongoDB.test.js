const mongoose = require('mongoose');
const mongooseInit = require('./mongoDB');
require('dotenv').config();

describe('mongoDB', () => {
  it('Mongo DB Connection', async () => {
    await mongooseInit();
    expect(mongoose.connection.readyState).toEqual(1);
  });
});
