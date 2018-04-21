import * as mongoose from 'mongoose';

const config = {
  db: 'mongodb://mongodb:27017'
};

export const mongooseClient = () => {
  (mongoose as any).Promise = global.Promise;
  mongoose.connection
    .on('error', err => {
      console.log(err);
    })
    .on('open', () => {
      console.log('Connection established with MongoDB');
    });

  return mongoose.connect(config.db);
};
