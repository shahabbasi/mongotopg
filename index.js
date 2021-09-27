require('dotenv').config()
const { RedisClient, getRedisClient } = require('./db-adaptors/redis');

const client = getRedisClient();
const redisClient = new RedisClient(client);

