require('dotenv').config()
const { RedisClient, getRedisClient } = require('./db-adaptors/redis');
const { getPostgresClient } = require('./db-adaptors/postgreSQL');
const { getMongoClient } = require('./db-adaptors/mongoDB');

async function init () {
    const redis = getRedisClient();
    const redisAsyncClient = new RedisClient(redis);
    const pgClient = getPostgresClient();
    const mongoClient = await getMongoClient();
}
