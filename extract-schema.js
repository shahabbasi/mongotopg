require('dotenv').config();
const readline = require('readline');
const { getMongoClient, closeMongoClient } = require('./db-adaptors/mongoDB');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function extractNames (doc, map) {
    if (doc.constructor.name === 'DBRef') {
        return doc.oid;
    }
    for (const field in doc) {
        const type = typeof(doc[field]);
        const existing = map[field];
        if (type === 'number' ||
        type === 'boolean' ||
        type === 'string' ||
        type === 'bigint') {
            if (existing && existing !== type) {
                console.log(`WARNING: field ${field} contains type: ${type} and ${existing}`);
            }
            map[field] = type;
        } else if (type === 'object') {
            if (doc[field].constructor.name === 'Date') {
                if (existing && existing !== 'date') {
                    console.log(`WARNING: field ${field} contains type: ${type} and ${existing}`);
                }
                map[field] = 'date';
                continue;
            }
            let innerMap = new Map();
            innerMap = extractNames(doc[field], innerMap);
            if (doc[field].constructor.name === 'Array') {
                map[field] = [innerMap.values().next().value];
            } else {
                map[field] = innerMap;
            }
        } else {
            console.log(doc);
            console.log(field);
            console.log(type);
            console.log(doc[field].constructor.name);
        }
    }
    return map;
}

async function extractSchema (schemaName) {
    const mongo = await getMongoClient();
    const collection = mongo.db().collection(schemaName);
    const cursor = collection.find({});
    let map = {};
    await cursor.forEach((doc) => {
        map = extractNames(doc, map);
        if (!doc) {
            closeMongoClient();
            return null;
        }
    });
    closeMongoClient();
    return map;
}

rl.question('What mongo collection\'s schema is being extracted?:', async (answer) => {
    try {
        const result = await extractSchema(answer)
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});

module.exports = { extractSchema };
