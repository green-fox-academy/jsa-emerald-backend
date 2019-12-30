const { mongoose } = require('../mongoDB');

const transaction = new mongoose.Schema({
  creator: mongoose.Schema.Types.ObjectId,
  amount: Number,
  labelName: String,
  date: String,
  type: String,
});

module.exports = { transaction };
