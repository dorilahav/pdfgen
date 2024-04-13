import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

import { apiRouter } from './api';
import { errorHandler } from './middlewares';

const app = new Hono();

app.use(secureHeaders());

app.route('/api/v1', apiRouter);

app.onError(errorHandler);

const port = 3000

serve({
  fetch: app.fetch,
  port
}, info => {
  console.log(`Server is running on port ${info.port}`)
});
