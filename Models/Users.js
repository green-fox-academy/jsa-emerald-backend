const mongoose = require('mongoose');

const users = new mongoose.Schema({
  username: String,
  email: String,
  hashedPass: String,
  transactions: Array,
  cusLabels: Array,
});

module.exports = mongoose.model('users', users);
