require('dotenv').config();
const debug = require('debug')('Emerald:Redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
}).on('error', (err) => {
  debug(err.message);
});

module.exports = { redisClient };
