const { mongoose } = require('../mongoDB');
const { transaction } = require('./Transaction');

const families = new mongoose.Schema({
  members: Array,
  creator: mongoose.Schema.Types.ObjectId,
  transactions: [transaction],
});

module.exports = { families };
