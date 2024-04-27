import { connectToAmqp, pdfGeneratedQueue, pdfGenerateStartedQueue, pdfRequestedQueue } from '@pdfgen/queuing';

import { initLogging, logger } from '@pdfgen/logging';
import * as path from 'path';
import { initializeFileManager } from './file-manager';
import createPdfWorker from './generate-pdf-worker';

const initQueuing = async () => {
  const connection = await connectToAmqp('amqp://localhost');

  await pdfRequestedQueue.init(connection);
  await pdfGenerateStartedQueue.init(connection);
  await pdfGeneratedQueue.init(connection);
}

const startListening = async () => {
  await pdfRequestedQueue.subscribe(createPdfWorker);
}

const start = async () => {
  try {
    await initializeFileManager();
  } catch (error) {
    throw new Error('An error has occurred while trying to initialize file manager', {cause: error});
  }

  try {
    await initQueuing();
  } catch (error) {
    throw new Error('An error has occurred while trying to initialize queuing', {cause: error});
  }

  try {
    await startListening();
  } catch (error) {
    throw new Error('An error has occurred while trying to start listening to queue events', {cause: error});
  }
}

try {
  initLogging({
    logFilePath: path.join('logs', 'app.log'),
    dev: true,
    debug: true
  });
} catch (error) {
  throw new Error('An error has occurred while trying to initialize logger', {cause: error});
}

start()
  .then(() => {
    logger.info('Pdf Generator instance is up!');
  })
  .catch(error => {
    logger.fatal(error);
  })