const express = require('express');
const debug = require('debug')('Emerald');
const cors = require('cors');
require('dotenv').config();

const app = express();
const indexRouter = require('./routes/index');

// middleware setup
app.use(cors());
app.use(express.json());

// Route
app.use('/', indexRouter);

app.listen(process.env.EXPRESS_PORT, () => {
  debug(`Server is running at port::${process.env.EXPRESS_PORT}`);
});
