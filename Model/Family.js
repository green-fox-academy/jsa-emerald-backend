const mongoose = require('mongoose');

const Family = new mongoose.Schema({
  members: Array,
  creator: mongoose.Schema.Types.ObjectId,
  transactions: Array,
});

module.exports = mongoose.model('Family', Family, 'Family');
