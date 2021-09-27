const redis = require('redis');
const { promisify } = require('util');

const {
    REDIS_URL,
    REDIS_HOST = '127.0.0.1',
    REDIS_PORT = '6379',
    REDIS_PASSWORD = '',
    REDIS_DB = '0',
} = process.env;
let redisClient = null;

function getRedisClient(client = null) {
    if (client != null) {
        redisClient = client;
    }

    if (redisClient != null) {
        return redisClient;
    }

    if (REDIS_URL) {
        redisClient = redis.createClient(REDIS_URL);
        return redisClient;
    }

    redisClient = redis.createClient({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
    });
    return redisClient;
}

class RedisClient {
    constructor (client) {
        if (!client instanceof redis.RedisClient) {
            throw Error('Passed redis client is of wrong type.');
        }
        this.client = client;
        this.asyncGet = promisify(client.get).bind(client);
        this.asyncSet = promisify(client.set).bind(client);
    }

    async get (key) {
        return await this.asyncGet(key);
    }

    async set (key, value) {
        return await this.asyncSet(key, value);
    }
}


module.exports = {
    RedisClient,
    getRedisClient,
};
