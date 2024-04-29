import { connectToAmqp, pdfGeneratedQueue, pdfRequestedQueue } from '@pdfgen/queuing';

import markPdfReady from './mark-pdf-ready-worker';

export const initQueuing = async (connectionString: string) => {
  const connection = await connectToAmqp(connectionString);

  await pdfRequestedQueue.init(connection);
  await pdfGeneratedQueue.init(connection);

  await pdfGeneratedQueue.subscribe(markPdfReady);
}