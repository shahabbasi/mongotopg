const { MongoClient } = require('mongodb');


const {
    MONGO_URL,
    MONGO_HOST = '127.0.0.1',
    MONGO_PORT = '27017',
    MONGO_USER = '',
    MONGO_PASSWORD = '',
    MONGO_DB = '',
} = process.env;
let mongoClient = null;


function getMongoUrl () {
    if (MONGO_URL) return MONGO_URL;
    return `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
}

async function getMongoClient (client = null) {
    if (client) return client;
    if (mongoClient) return mongoClient;
    client = new MongoClient(getMongoUrl());

    try {
        await client.connect();
        mongoClient = client;
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        return client;
    }
}

async function closeMongoClient (client) {
    try {
        await client.close();
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getMongoClient, closeMongoClient };
