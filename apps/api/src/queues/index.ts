import { connectToAmqp, pdfGeneratedQueue, pdfRequestedQueue } from '@pdfgen/queuing';

import updatePdfToGeneratedWorker from './update-pdf-to-generated-worker';

export const initQueuing = async (connectionString: string) => {
  const connection = await connectToAmqp(connectionString);

  await pdfRequestedQueue.init(connection);
  await pdfGeneratedQueue.init(connection);

  await pdfGeneratedQueue.subscribe(updatePdfToGeneratedWorker);
}