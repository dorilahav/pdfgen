import { serve, } from '@hono/node-server';
import { initLogging, logger } from '@pdfgen/logging';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as loggingMiddleware } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { connect as connectMongoose } from 'mongoose';

import { AddressInfo } from 'net';
import * as path from 'path';
import apiRouter from './api';
import { initializeFileManager } from './file-manager';
import { errorHandler, globalRateLimiter, initRateLimit } from './middlewares';
import { initQueuing } from './queues';

const createApp = () => new Hono()
  .use(
    loggingMiddleware(log => {
      logger.debug(log);
    })
  )
  .use(
    cors({
      origin: [
        'http://localhost:5173' // TODO: change this to production
      ],
      allowMethods: ['GET', 'POST', 'OPTIONS']
    })
  )
  .use(secureHeaders())
  .use(globalRateLimiter())
  .route('/api/v1', apiRouter())
  .onError(errorHandler);

const port = 3000

const start = async (): Promise<AddressInfo> => {
  try {
    await connectMongoose('mongodb://localhost:27017/pdf-gen');
  } catch (error) {
    throw new Error('An error has occurred while trying to initialize mongo db connection', {cause: error});
  }

  try {
    await initializeFileManager();
  } catch (error) {
    throw new Error('An error has occurred while trying to initialize file manager', {cause: error});
  }

  try {
    await initQueuing("amqp://localhost");
  } catch (error) {
    throw new Error('An error occurred while trying to initialize queuing', {cause: error});
  }

  try {
    await initRateLimit();
  } catch (error) {
    throw new Error('An error occurred while trying to initialize rate limiting', {cause: error});
  }

  const app = createApp();

  return new Promise(resolve => {
    serve({fetch: app.fetch, port}, info => {
      resolve(info);
    });
  })
}

try {
  // TODO: update fields based on environment
  initLogging({
    logFilePath: path.join('logs', 'app.log'),
    dev: true,
    debug: true,
    environment: 'development'
  });
} catch (error) {
  throw new Error('An error has occurred while trying to initialize logger', {cause: error});
}

start()
  .then(info => {
    logger.info(`Api is running on port ${info.port}`)
  })
  .catch(error => {
    logger.fatal(error);
  })