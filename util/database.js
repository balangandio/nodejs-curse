const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb://node-curse-app:node-curse-pass@192.168.168.1/node-complete?retryWrites=true')
        .then(client => {
            _db = client.db();

            cb();
        })
        .catch(err => {
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No database found';
};

module.exports = { mongoConnect, getDb };
