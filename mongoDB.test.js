const mongooseInit = require('./mongoDB');
require('dotenv').config();

describe('mongoDB', () => {
  it('Mongo DB Connection', async () => {
    const conn = await mongooseInit();
    expect(conn.connection.readyState).toEqual(1);
  });
});
