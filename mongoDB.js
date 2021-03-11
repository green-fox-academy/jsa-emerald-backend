const mongoose = require('mongoose');

const mongooseInit = () => mongoose
  .connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}`, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useCreateIndex: true,
  });

module.exports = mongooseInit;
