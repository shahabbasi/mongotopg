const knex = require('knex');


const {
    PG_URL,
    PG_HOST = '127.0.0.1',
    PG_PORT = '5432',
    PG_USER = 'user',
    PG_PASSWORD = 'password',
    PG_DB = 'mongotopg',
} = process.env;
let pgClient = null;

function getPostgresClient (client = null) {
    if (client) {
        pgClient = client;
    }

    if (pgClient) {
        return pgClient;
    }

    if (PG_URL) {
        pgClient = knex({
            client: 'pg',
            connection: PG_URL
        });
        return pgClient;
    }

    pgClient = knex({
        client: 'pg',
        connection: {
            host: PG_HOST,
            port: PG_PORT,
            user: PG_USER,
            password: PG_PASSWORD,
            database: PG_DB,
        }
    });
    return pgClient;
}

module.exports = { getPostgresClient }
