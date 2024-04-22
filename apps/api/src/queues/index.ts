import { connectToAmqp, pdfGeneratedQueue, pdfGenerateStartedQueue, pdfRequestedQueue } from '@pdfgen/queuing';

import updatePdfToGeneratingWorker from './update-pdf-to-generating-worker';
import updatePdfToReadyWorker from './update-pdf-to-ready-worker';

export const initQueuing = async (connectionString: string) => {
  const connection = await connectToAmqp(connectionString);

  await pdfRequestedQueue.init(connection);
  await pdfGenerateStartedQueue.init(connection);
  await pdfGeneratedQueue.init(connection);

  await pdfGenerateStartedQueue.subscribe(updatePdfToGeneratingWorker);
  await pdfGeneratedQueue.subscribe(updatePdfToReadyWorker);
}