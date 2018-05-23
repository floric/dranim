import MongodbMemoryServer from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

export const MONGO_DB_NAME = 'jest';
export const mongodb = new MongodbMemoryServer({
  instance: {
    dbName: MONGO_DB_NAME
  },
  autoStart: false
});
