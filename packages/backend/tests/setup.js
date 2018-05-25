const MongodbMemoryServer = require('mongodb-memory-server');

console.log('Setup test environment.');

const MONGO_DB_NAME = 'jest';
const mongod = new MongodbMemoryServer.default({
  instance: {
    dbName: MONGO_DB_NAME
  }
});

module.exports = function() {
  global.__MONGOD__ = mongod;
  global.__MONGO_DB_NAME__ = MONGO_DB_NAME;
};
