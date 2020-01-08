const mongoose = require('mongoose');
const mongooseInit = require('./mongoDB');

describe('mongoDB', () => {
  it('Mongo DB Connection', () => {
    mongooseInit().then(() => (expect(mongoose.connection.readyState).toEqual(1)));
  });
});
