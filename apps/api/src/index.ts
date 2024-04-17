import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

import { AddressInfo } from 'net';
import { apiRouter } from './api';
import { errorHandler } from './middlewares';
import { initQueuing } from './queues';

const app = new Hono();

app.use(secureHeaders());
app.route('/api/v1', apiRouter);
app.onError(errorHandler);

const port = 3000

const start = async (): Promise<AddressInfo> => {
  await initQueuing("amqp://localhost");

  return new Promise(resolve => {
    serve({fetch: app.fetch, port}, info => {
      resolve(info);
    });
  })
}

start()
  .then(info => {
    console.log(`Server is running on port ${info.port}`)
  });