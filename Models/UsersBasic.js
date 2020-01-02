const { mongoose } = require('../mongoDB');

const usersBasic = new mongoose.Schema({
  username: String,
  email: String,
  hashedPass: String,
});

module.exports = mongoose.model('users', usersBasic);
