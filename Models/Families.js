const mongoose = require('mongoose');

const families = new mongoose.Schema({
  members: Array,
  creator: mongoose.Schema.Types.ObjectId,
  transactions: Array,
});

module.exports = mongoose.model('families', families);
