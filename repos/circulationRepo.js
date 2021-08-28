const { MongoClient, ObjectId } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);

            try {
                await client.connect();
                const db = client.db(dbName);

                let items = db.collection('newspapers').find(query);

                if (limit > 0) {
                    items = items.limit(limit);
                }

                resolve(await items.toArray());
                client.close();
            } catch (error) {
                reject(error);
            }
        });
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const item = await db.collection('newspapers').findOne({ _id: ObjectId(id) });
                resolve(item);
                client.close();
            } catch (error) {
                reject(error);
            }
        });
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const addedItem = await db.collection('newspapers').insertOne(item);

                resolve(addedItem.insertedId);
                client.close();
            } catch (error) {
                reject(error);
            }
        });
    }

    function update(id, newItem) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const updatedItem = await db.collection('newspapers').findOneAndReplace({_id: ObjectId(id)}, newItem, {returnOriginal:false});

                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error);
            }
        });
    }

    function remove(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const removed = await db.collection('newspapers').deleteOne({_id: ObjectId(id)});

                resolve(removed.deletedCount === 1);
                client.close();
            } catch (error) {
                reject(error);
            }
        });
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);

            try {
                await client.connect();
                const db = client.db(dbName);

                results = await db.collection('newspapers').insertMany(data);
                resolve(results);

                client.close();

            } catch (error) {
                reject(error);
            }
        })
    }

    return { loadData, get, getById, add, update, remove }
}

module.exports = circulationRepo();