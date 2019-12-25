const debug = require('debug')('Emerald:Mongo');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}`, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => debug('MongoDB Connection Success'));
mongoose.connection.on('error', (err) => debug(err.message));

module.exports = { mongoose };
