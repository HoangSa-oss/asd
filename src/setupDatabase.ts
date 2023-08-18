import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';
<<<<<<< HEAD

=======
import { redisConnect } from './shared/service/redis/redis.connection';
>>>>>>> a5fc5ff (hihi)
const log:Logger = config.createLogger('database')

export default () => {
  const connect = () => {
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
       log.info('Successfully connected to database.');
<<<<<<< HEAD
=======
       redisConnect.connect()
>>>>>>> a5fc5ff (hihi)
      })
      .catch((error) => {
        log.error('Error connecting to database', error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
