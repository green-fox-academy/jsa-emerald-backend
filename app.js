const express = require('express');
const debug = require('debug')('Emerald');
const cors = require('cors');
require('dotenv').config();
const mongooseInit = require('./mongoDB');

const app = express();
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const familyRouter = require('./routes/family');

// DB Init
mongooseInit();

// middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route
app.use('/', indexRouter);
app.use('/', userRouter);
app.use('/', familyRouter);

app.get('*', (req, res) => {
  res.sendStatus(404);
});

app.post('*', (req, res) => {
  res.sendStatus(404);
});

app.listen(process.env.EXPRESS_PORT, () => {
  debug(`Server is running at port::${process.env.EXPRESS_PORT}`);
});

module.exports = app;
