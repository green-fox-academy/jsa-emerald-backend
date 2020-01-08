const mongoose = require('mongoose');
const mongooseInit = require('./mongoDB');

describe('mongoDB', () => {
  it('Mongo DB Connection', () => {
    mongooseInit();
    setTimeout(() => {
      expect(mongoose.connection.readyState).toEqual(1);
    }, 1500);
  });
});
