import { connectToAmqp, pdfGeneratedQueue, pdfGenerateStartedQueue, pdfRequestedQueue } from '@pdfgen/queuing';

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

initQueuing()
  .then(startListening)
  .then(() => {
    // TODO: logging
    console.log('Done!');
  });