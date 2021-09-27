require('dotenv').config()
const { RedisClient, getRedisClient } = require('./db-adaptors/redis');
const { getPostgresClient } = require('./db-adaptors/postgreSQL');

const redis = getRedisClient();
const redisClient = new RedisClient(redis);
const pgClient = getPostgresClient();

