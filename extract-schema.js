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
        let fields = [];
        if (typeof(map[field]) == 'string') {
            fields = map[field] ? map[field].split('|') : [];
        } else if (map[field] != null && typeof(map[field] == 'object')) {
            fields = map[field];
        }
        if (type === 'number' ||
        type === 'boolean' ||
        type === 'string' ||
        type === 'bigint') {
            if (fields.length > 0 && fields.indexOf(type) === -1) {
                console.log(`WARNING: field ${field} contains type: ${type} and ${fields.join(' and ')}`);
                fields.push(type);
            } else if (fields.length === 0) {
                fields[0] = type;
            }
            map[field] = `${fields.join('|')}`;
        } else if (type === 'object') {
            if (doc[field].constructor.name === 'Date') {
                if (fields.length > 0 && fields.indexOf('date') === -1) {
                    console.log(`WARNING: field ${field} contains type: date and ${fields.join(' and ')}`);
                    fields.push('date');
                } else if (fields.length === 0) {
                    fields[0] = 'date';
                }
                map[field] = `${fields.join('|')}`;
                continue;
            }
            const innerMap = extractNames(doc[field], {});
            if (doc[field].constructor.name === 'Array') {
                map[field] = [innerMap[0]];
            } else {
                map[field] = innerMap;
            }
        } else if (type === 'function') {
            console.log(doc[field]());
            break;
        } else {
            console.error('Unhandled field type...');
            console.log(doc);
            console.log(field);
            console.log(type);
            console.log(doc[field].constructor.name);
        }
    }
    return map;
}

async function extractSchema (schemaName, depht) {
    const mongo = await getMongoClient();
    const collection = mongo.db().collection(schemaName);
    let cursor = collection.find({});
    let map = {};
    let limit = Infinity;
    if (depht) {
        limit = depht;
    }
    let counter = 0;
    try {
        await cursor.forEach((doc) => {
            map = extractNames(doc, map);
            counter ++;
            if (counter == limit) {
                throw new Error('Just to break forEach.');
            }
            if (!doc) {
                closeMongoClient();
                return null;
            }
        });
    } catch (error) {
        console.log(error.message);
    }
    closeMongoClient();
    return map;
}

rl.question('What mongo collection\'s schema is being extracted?(schema|depht): ', async (answer) => {
    try {
        const result = await extractSchema(answer.split('|')[0], answer.split('|')[1])
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});

module.exports = { extractSchema };
