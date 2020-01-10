const mongoose = require('mongoose');

const User = new mongoose.Schema({
  username: String,
  email: String,
  hashedPass: String,
  transactions: Array,
  cusLabels: Array,
});

module.exports = mongoose.model('User', User, 'User');
