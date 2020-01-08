const mongoose = require('mongoose');

const transactions = new mongoose.Schema({
  creator: mongoose.Schema.Types.ObjectId,
  amount: Number,
  labelName: String,
  date: String,
  type: String,
});

module.exports = mongoose.model('transactions', transactions);
