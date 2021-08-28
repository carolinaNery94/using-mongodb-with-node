const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');

const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
    const client = new MongoClient(url);
    await client.connect();

    try {
        const results = await circulationRepo.loadData(data);
        assert.equal(data.length, results.insertedCount);
        console.log(results.insertedCount, results);

        const getData = await circulationRepo.get();
        assert.equal(data.length, getData.length);

        const filterData = await circulationRepo.get({ Newspaper: getData[4].Newspaper });
        assert.deepEqual(filterData[0], getData[4]);

        const limitData = await circulationRepo.get({}, 3);
        assert.deepEqual(limitData.length, 3);

        const id = getData[4]._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepEqual(byId, getData[4]);

        const newItem = {
            "Newspaper": "My Paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        }

        const addedItemId = await circulationRepo.add(newItem);
        assert(addedItemId);

        const addedItemQuery = await circulationRepo.getById(addedItemId);
        assert.deepEqual(addedItemQuery, newItem);

        const updatedItem = await circulationRepo.update(addedItemId, {
            "Newspaper": "My new Paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        })

        const newAddedItemQuery = await circulationRepo.getById(addedItemId);
        assert.equal(newAddedItemQuery.Newspaper, "My new Paper");

        const removed = await circulationRepo.remove(addedItemId);
        assert(removed);

        const deletedItem = await circulationRepo.getById(addedItemId);
        assert.equal(deletedItem, null);

    } catch (error) {
        console.log(error);
    } finally {
        const admin = client.db(dbName).admin();

        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases());

        client.close();

    }
}

main();