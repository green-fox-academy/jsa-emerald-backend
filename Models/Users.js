const { mongoose } = require('../mongoDB');

const usersBasic = new mongoose.Schema({
  username: String,
  email: String,
  hashedPass: String,
});

const usersFull = new mongoose.Schema({
  username: String,
  email: String,
  hashedPass: String,
  transactions: Array,
  cusLabels: Array,
});

module.exports = { usersBasic, usersFull };
