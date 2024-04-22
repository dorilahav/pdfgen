import { connectToAmqp, pdfGenerationJobsQueue } from '@pdfgen/queuing';

import pdfGenerationJobWorker from './pdf-generation-job-worker';

const initQueuing = async () => {
  const connection = await connectToAmqp('amqp://localhost');

  await pdfGenerationJobsQueue.init(connection);
}

const startListening = async () => {
  await pdfGenerationJobsQueue.subscribe(pdfGenerationJobWorker);
}

initQueuing()
  .then(startListening)
  .then(() => {
    // TODO: logging
    console.log('Done!');
  });