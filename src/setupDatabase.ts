import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';
import { redisConnect } from './shared/services/redis/redis.connection';
const log:Logger = config.createLogger('database')

export default () => {
  const connect = () => {
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
       log.info('Successfully connected to database.');
       redisConnect.connect()
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
