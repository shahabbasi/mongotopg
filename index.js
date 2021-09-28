require('dotenv').config()
const readline = require('readline');
const { RedisClient, getRedisClient } = require('./db-adaptors/redis');
const { getPostgresClient } = require('./db-adaptors/postgreSQL');
const { getMongoClient, closeMongoClient } = require('./db-adaptors/mongoDB');
const { exit } = require('process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


async function init () {
    const redis = getRedisClient();
    const redisAsyncClient = new RedisClient(redis);
    const pgClient = getPostgresClient();
    const mongoClient = await getMongoClient();
    return {
        redisAsyncClient,
        pgClient,
        mongoClient,
    };
}

rl.question('What mongo collection is being exported?:', async (answer) => {
    try {
        const {
            mongoClient: mongo,
            pgClient: postgres,
            redisAsyncClient: redis,
        } = await init();

        closeMongoClient(mongo);
        exit(0);
    } catch (error) {
        console.log(error);
        closeMongoClient();
        exit(0);
    }
});

