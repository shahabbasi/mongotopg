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
        const existing = map.get(field);
        if (type === 'number' ||
        type === 'boolean' ||
        type === 'string' ||
        type === 'bigint') {
            if (existing && existing !== type) {
                console.log(`WARNING: field ${field} contains type: ${type} and ${existing}`);
            }
            map.set(field, type);
        } else if (type === 'object') {
            if (doc[field].constructor.name === 'Date') {
                if (existing && existing !== 'date') {
                    console.log(`WARNING: field ${field} contains type: ${type} and ${existing}`);
                }
                map.set(field, 'date');
                continue;
            }
            let innerMap = new Map();
            innerMap = extractNames(doc[field], innerMap);
            if (doc[field].constructor.name === 'Array') {
                map.set(field, [innerMap.values().next().value]);
            } else {
                map.set(field, innerMap);
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

rl.question('What mongo collection\'s schema is being extracted?:', async (answer) => {
    try {
        const mongo = await getMongoClient();
        const collection = mongo.db().collection(answer);
        const cursor = collection.find({});
        let map = new Map();
        await cursor.forEach((doc) => {
            map = extractNames(doc, map);
            if (!doc) {
                closeMongoClient(mongo);
                exit(0);
            }
        });
        console.log(map);
    } catch (error) {
        console.log(error);
        closeMongoClient();
        exit(0);
    }
});
