const mongoose = require('mongoose');

const Family = new mongoose.Schema({
  members: Array,
  creator: String,
  transactions: Array,
});

module.exports = mongoose.model('Family', Family, 'Family');
