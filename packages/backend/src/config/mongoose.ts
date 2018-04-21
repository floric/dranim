import * as mongoose from 'mongoose';

console.log();

const config = {
  db:
    process.env.NODE_ENV === 'development'
      ? 'mongodb://127.0.0.1:27017'
      : 'mongodb://mongodb:27017'
};

export const mongooseClient = async () => {
  try {
    (mongoose as any).Promise = global.Promise;
    mongoose.connection
      .on('error', err => {
        console.log(err);
      })
      .on('open', () => {
        console.log('Connection established with MongoDB');
      });

    const client = await mongoose.connect(config.db);
    if (client.connection.readyState !== 1) {
      console.warn('Database not ready...');
      return;
    }

    console.info('Database working.');
  } catch (err) {
    console.error(err);
  }
};
