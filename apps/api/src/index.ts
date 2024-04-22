import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { connect as connectMongoose } from 'mongoose';

import { AddressInfo } from 'net';
import { apiRouter } from './api';
import { errorHandler } from './middlewares';
import { initQueuing } from './queues';

const app = new Hono();

app.use(logger());
app.use(secureHeaders());
app.route('/api/v1', apiRouter);
app.onError(errorHandler);

const port = 3000

const start = async (): Promise<AddressInfo> => {
  try {
    await connectMongoose('mongodb://localhost:27017/pdf-gen');
  } catch (error) {
    throw new Error('An error has occurred while trying to initialize mongo db connection', {cause: error});
  }

  try {
    await initQueuing("amqp://localhost");
  } catch (error) {
    throw new Error('An error occurred while trying to initialize queuing', {cause: error});
  }

  return new Promise(resolve => {
    serve({fetch: app.fetch, port}, info => {
      resolve(info);
    });
  })
}

start()
  .then(info => {
    // TODO: logging
    console.log(`Server is running on port ${info.port}`)
  });